import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 1. Get the 'campusId' from the URL query parameters.
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get("campusId");

    // This API is now dependent on the frontend providing the correct campusId.
    if (!campusId) {
      return NextResponse.json(
        { success: false, error: "Campus ID is required" },
        { status: 400 }
      );
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 2. All database queries are now strictly filtered by the provided 'campusId'.
    const [totalCounts, presentCounts] = await Promise.all([
      // Get total attendance records for students of this campus
      prisma.attendance.groupBy({
        by: ["studentId"],
        where: {
          student: { user: { campusId } },
          studentId: { not: null },
        },
        _count: { _all: true },
      }),
      // Get total 'PRESENT' attendance records for students of this campus
      prisma.attendance.groupBy({
        by: ["studentId"],
        where: {
          student: { user: { campusId } },
          studentId: { not: null },
          status: "PRESENT",
        },
        _count: { _all: true },
      }),
    ]);

    // 3. Process the scoped student data to calculate percentages.
    const studentIds = totalCounts
      .map((record) => record.studentId)
      .filter((id): id is string => id !== null);

    const students = await prisma.student.findMany({
      where: { id: { in: studentIds } },
      select: {
        id: true,
        user: { select: { name: true } },
      },
    });

    const studentNameMap = new Map(
      students.map((s) => [s.id, s.user?.name || "Unknown Student"])
    );
    const presentMap = new Map(
      presentCounts.map((record) => [
        record.studentId,
        record._count?._all ?? 0,
      ])
    );

    const studentList = totalCounts
      .filter((record) => record.studentId)
      .map((record) => {
        const total = record._count?._all ?? 0;
        const present = presentMap.get(record.studentId!) || 0;
        return {
          name: studentNameMap.get(record.studentId!) || "Unknown Student",
          percentage: total > 0 ? Math.round((present / total) * 100) : 0,
        };
      });

    // 4. Get today's activity for teachers of this campus.
    // First, get a list of all teacher PROFILE IDs belonging to the campus.
    const campusTeachers = await prisma.teacher.findMany({
      where: { user: { campusId } },
      select: { id: true },
    });

    const campusTeacherIds = campusTeachers.map((t) => t.id);

    const teacherCounts = await prisma.attendance.groupBy({
      by: ["markedBy"],
      where: {
        markedBy: { in: campusTeacherIds },
        markedAt: { gte: todayStart },
      },
      _count: { _all: true },
    });

    // 5. Process the scoped teacher data
    const teacherProfileIds = teacherCounts
      .map((record) => record.markedBy)
      .filter((id): id is string => id !== null);
    const teachers = await prisma.teacher.findMany({
      where: { id: { in: teacherProfileIds } },
      select: { id: true, user: { select: { name: true } } },
    });

    const teacherNameMap = new Map(
      teachers.map((t) => [t.id, t.user.name || "Unknown Teacher"])
    );

    const teacherActivity = teacherCounts.map((record) => ({
      name: teacherNameMap.get(record.markedBy!) || "Unknown Teacher",
      count: record._count?._all ?? 0,
    }));

    // 6. Calculate the final analytics based on the scoped data.
    const topStudents = [...studentList]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);

    const atRiskStudents = [...studentList]
      .filter((student) => student.percentage < 75) 
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3);
    return NextResponse.json(
      {
        success: true,
        topStudents,
        atRiskStudents,
        teacherActivity,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in dashboard API:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
