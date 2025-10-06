import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherUserId = searchParams.get("teacherId");
    const campusId = searchParams.get("campusId");

    if (!teacherUserId || !campusId) {
      return NextResponse.json(
        { error: "Teacher ID and Campus ID are required" },
        { status: 400 }
      );
    }
    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: teacherUserId,
        user: {
          campusId: campusId,
        },
      },
      select: { id: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found on this campus" }, { status: 404 });
    }
    const subjects = await prisma.teacherSubject.findMany({
      where: { teacherId: teacher.id },
      select: {
        id: true,
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        semester: {
          select: {
            id: true,
            name: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(subjects);
  } catch (err: any) {
    console.error("Error fetching teacher's subjects:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}