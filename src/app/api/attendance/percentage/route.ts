import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Get both studentId and campusId from the URL
    const studentId = searchParams.get("studentId");
    const campusId = searchParams.get("campusId");

    if (!studentId || !campusId) {
      return NextResponse.json(
        { error: "Student ID and Campus ID are required" },
        { status: 400 }
      );
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        // 2. The 'where' clause now securely filters by both studentId AND campusId.
        userId: studentId,
        user: {
          campusId: campusId,
        },
        classSession: {
          isNot: null,
        },
      },
      include: {
        classSession: {
          select: {
            subject: true,
            subjectRel: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (attendances.length === 0) {
      return NextResponse.json([]);
    }

    const subjectMap: Record<string, { present: number; total: number }> = {};

    for (const att of attendances) {
      const subject =
        att.classSession?.subjectRel?.name || att.classSession?.subject;
      if (!subject) continue;

      if (!subjectMap[subject]) {
        subjectMap[subject] = { present: 0, total: 0 };
      }

      subjectMap[subject].total++;
      if (att.status === "PRESENT" || att.status === "LATE") {
        subjectMap[subject].present++;
      }
    }

    const result = Object.entries(subjectMap).map(([subject, stats]) => {
      const percentage = parseFloat(
        ((stats.present / stats.total) * 100).toFixed(1)
      );
      return { subject, percentage };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching attendance percentage by subject:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance percentage by subject" },
      { status: 500 }
    );
  }
}
