import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId"); // This is the Teacher User ID
    const campusId = searchParams.get("campusId");

    if (!teacherId || !campusId) {
      return NextResponse.json({ error: "Teacher ID and Campus ID are required" }, { status: 400 });
    }

    // Securely find the teacher's profile ID based on their User ID and Campus ID
    const teacherProfile = await prisma.teacher.findFirst({
      where: {
        userId: teacherId,
        user: { campusId: campusId },
      },
      select: { id: true },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: "Teacher not found on this campus." }, { status: 404 });
    }

    // Fetch all timetable entries for this teacher
    const timetableEntries = await prisma.timetableEntry.findMany({
      where: {
        teacherId: teacherProfile.id,
        campusId: campusId,
      },
      orderBy: { weekday: "asc" }, // You can order by day, then time
      include: {
        subject: { select: { id: true,name: true, code: true } },
        section: { select: { id: true,name: true } },
        semester: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, classes: timetableEntries });
  } catch (err: any) {
    console.error("Error fetching teacher's classes:", err);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}