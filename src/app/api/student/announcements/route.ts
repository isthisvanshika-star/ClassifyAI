import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const campusId = searchParams.get("campusId");

    if (!studentId || !campusId) {
      return NextResponse.json(
        { error: "Student ID and Campus ID are required" },
        { status: 400 }
      );
    }
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        campusId: campusId,
        role: "STUDENT",
      },
      include: {
        studentProfile: {
          include: {
            section: { select: { name: true } },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found on this campus." },
        { status: 404 }
      );
    }
    const announcements = await prisma.announcement.findMany({
      where: {
        author: {
          user: { campusId: campusId },
        },
        OR: [
          { targetAll: true },
          {
            targetSemester: student.semester,
            targetSection: student.studentProfile?.section?.name,
          },
        ],
        isActive: true,
      },
      include: {
        author: { include: { user: { select: { name: true } } } },
        attachments: { select: { title: true, url: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, announcements });
  } catch (error) {
    console.error("Error fetching student announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements." },
      { status: 500 }
    );
  }
}
