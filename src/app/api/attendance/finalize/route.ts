import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 }
      );
    }

    const tokenRecord = await prisma.attendanceToken.findUnique({
      where: { token },
      include: {
        student: true,
        teacher: { include: { user: { select: { campusId: true } } } },
      },
    });

    if (!tokenRecord || !tokenRecord.student || !tokenRecord.subjectId) {
      return NextResponse.json(
        { message: "Invalid token or session details not found" },
        { status: 404 }
      );
    }

    const sectionId = tokenRecord.student.sectionId;
    if (!sectionId) {
      return NextResponse.json(
        { message: "Student is not assigned to a section." },
        { status: 400 }
      );
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const classSession = await prisma.classSession.findFirst({
      where: {
        subjectId: tokenRecord.subjectId,
        teacherId: tokenRecord.professorId,
        startTime: { gte: startOfDay },
      },
    });

    if (!classSession) {
      return NextResponse.json(
        { message: "Corresponding class session for today not found." },
        { status: 404 }
      );
    }

    const allStudentIdsInSection = (
      await prisma.student.findMany({
        where: { sectionId },
        select: { id: true },
      })
    ).map((s) => s.id);

    const presentStudentIds = (
      await prisma.attendance.findMany({
        where: { classSessionId: classSession.id, status: "PRESENT" },
        select: { studentId: true },
      })
    )
      .map((a) => a.studentId)
      .filter((id): id is string => id !== null);

    const absentStudentIds = allStudentIdsInSection.filter(
      (id) => !presentStudentIds.includes(id)
    );

    if (absentStudentIds.length === 0) {
      return NextResponse.json({
        message: "All students are present. No one marked as absent.",
      });
    }

    const absentData = absentStudentIds.map((studentId) => ({
      studentId,
      classSessionId: classSession.id,
      status: "ABSENT" as const,
      markedBy: "SYSTEM",
      markedAt: new Date(),
      remarks: "Automatically marked absent after session expired.",
    }));

    await prisma.attendance.createMany({
      data: absentData,
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: `Successfully marked ${absentStudentIds.length} students as absent.`,
    });
  } catch (error) {
    console.error("Error finalizing attendance:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
