import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // 1. Get both studentId and campusId from the URL
    const studentId = searchParams.get("studentId");
    const campusId = searchParams.get("campusId");

    if (!studentId || !campusId) {
      return NextResponse.json(
        { error: "Student ID and Campus ID are required" },
        { status: 400 }
      );
    }

    // Use a single groupBy query for efficiency
    const attendanceGroups = await prisma.attendance.groupBy({
      by: ["status"],
      // 2. Add campusId to the 'where' clause to securely scope the query
      where: {
        userId: studentId,
        user: {
          campusId: campusId,
        },
      },
      _count: {
        status: true,
      },
    });

    // Initialize counts
    let presents = 0;
    let absents = 0;
    let late = 0;

    // Process the grouped results
    for (const group of attendanceGroups) {
      const count = group._count.status;
      switch (group.status) {
        case "PRESENT":
          presents = count;
          break;
        case "ABSENT":
          absents = count;
          break;
        case "LATE":
          late = count;
          break;
      }
    }

    const totalClasses = presents + absents + late;
    // 'Late' is often counted as present for percentage calculations
    const presentAndLate = presents + late; 
    const percentage =
      totalClasses > 0
        ? ((presentAndLate / totalClasses) * 100).toFixed(2)
        : "0.00";

    return NextResponse.json({
      totalClasses,
      presents,
      absents,
      late,
      presentPercentage: percentage,
    });
  } catch (error) {
    console.error("Error fetching attendance statistics:", error);
    return NextResponse.json(
      { error: "Error fetching attendance statistics" },
      { status: 500 }
    );
  }
}