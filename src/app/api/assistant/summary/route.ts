import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  try {
    // 1. Get the campusId from the URL query parameters
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get('campusId');

    if (!campusId) {
      return NextResponse.json({ error: "Campus ID is required" }, { status: 400 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalStudents, totalTeachers, totalAttendance, tokensToday] =
      await Promise.all([
        // Counts students only within the specified campus
        prisma.user.count({ 
            where: { role: "STUDENT", campusId: campusId } 
        }),
        // Counts teachers only within the specified campus
        prisma.user.count({ 
            where: { role: "TEACHER", campusId: campusId } 
        }),
        // Counts attendance records for students of the specified campus
        prisma.attendance.count({
          where: {
            markedAt: { gte: todayStart },
            student: { user: { campusId: campusId } },
          },
        }),
        // Counts tokens issued to students of the specified campus
        prisma.attendanceToken.count({
          where: {
            issuedAt: { gte: todayStart },
            student: { user: { campusId: campusId } },
          },
        }),
      ]);

      return NextResponse.json({
        totalStudents,
        totalTeachers,
        totalAttendance,
        tokensToday,
      });
  } catch (error) {
      console.error("Error fetching summary data:", error);
      return NextResponse.json(
        { error: "Failed to fetch summary data" },
        { status: 500 }
      );
  }
}