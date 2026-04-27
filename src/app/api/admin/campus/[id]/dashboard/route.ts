import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campusId = params.id;

    const [students, teachers, subjects, recentActivity] =
      await Promise.all([
        prisma.student.count({
          where: { user: { campusId } },
        }),

        prisma.teacher.count({
          where: { user: { campusId } },
        }),

        prisma.subject.count({
          where: { campusId },
        }),

        prisma.recentActivity.findMany({
          where: { user: { campusId } },
          orderBy: { timestamp: "desc" },
          take: 5,
        }),
      ]);

    return NextResponse.json({
      students,
      teachers,
      subjects,
      recentActivity,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard" },
      { status: 500 }
    );
  }
}