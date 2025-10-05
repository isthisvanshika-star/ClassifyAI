import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const editAttendanceSchema = z.object({
  attendanceId: z.string().cuid(),
  teacherId: z.string().cuid(), // The Teacher User ID
  newStatus: z.enum(["PRESENT", "ABSENT", "LATE", "PENDING"]),
});

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = editAttendanceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { attendanceId, teacherId, newStatus } = validation.data;

    // --- AUTHORIZATION CHECK ---
    // 1. Find the teacher's profile ID
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: teacherId },
      select: { id: true },
    });
    if (!teacherProfile) {
      return NextResponse.json({ error: "Teacher profile not found." }, { status: 404 });
    }

    // 2. Find the attendance record and its associated class session
    const attendanceRecord = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      select: { classSession: { select: { teacherId: true } } },
    });

    // 3. Verify that the teacher of the class matches the teacher making the request
    if (!attendanceRecord || attendanceRecord.classSession?.teacherId !== teacherProfile.id) {
      return NextResponse.json({ error: "You are not authorized to edit this record." }, { status: 403 });
    }
    // --- END AUTHORIZATION ---

    // 4. If authorized, update the attendance status
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: { status: newStatus },
    });

    return NextResponse.json({ success: true, attendance: updatedAttendance });

  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json({ error: "Failed to update attendance." }, { status: 500 });
  }
}