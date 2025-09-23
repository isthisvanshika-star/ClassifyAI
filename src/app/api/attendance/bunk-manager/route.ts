import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // 1. Get both studentId and campusId from the URL
    const studentId = searchParams.get("studentId");
    const campusId = searchParams.get("campusId");

    if (!studentId || !campusId) {
      return NextResponse.json({ error: "Student ID and Campus ID are required" }, { status: 400 });
    }

    const MIN_PERCENTAGE = 75;

    const allAttendance = await prisma.attendance.findMany({
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

    // Group the attendance records by subject
    const subjectStats = allAttendance.reduce((acc, record) => {
      const subject = record.classSession?.subjectRel?.name || record.classSession?.subject;
      if (!subject) return acc;

      if (!acc[subject]) {
        acc[subject] = { total: 0, present: 0 };
      }

      acc[subject].total += 1;
      if (record.status === "PRESENT" || record.status === "LATE") {
        acc[subject].present += 1;
      }

      return acc;
    }, {} as Record<string, { total: number; present: number }>);

    // Calculate the percentage and safe bunks for each subject
    const result = Object.entries(subjectStats).map(([subject, stats]) => {
      const { total, present } = stats;
      const percentage = total > 0 ? (present / total) * 100 : 0;

      // Formula to calculate how many classes can be missed without dropping below the minimum percentage
      const safeBunks = Math.floor((present * 100) / MIN_PERCENTAGE - total);

      return {
        subject,
        totalClasses: total,
        attendedClasses: present,
        percentage: Number(percentage.toFixed(2)),
        // Ensure the number of bunks is never negative
        safeBunks: Math.max(safeBunks, 0),
      };
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("Error fetching bunk manager data:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}