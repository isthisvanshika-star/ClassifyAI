import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const campusId = searchParams.get("campusId");

    if (!teacherId || !campusId) {
      return NextResponse.json({ error: "Teacher ID and Campus ID are required" }, { status: 400 });
    }
    const teacherProfile = await prisma.teacher.findFirst({
      where: { userId: teacherId, user: { campusId: campusId } },
      select: { id: true },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: "Teacher not found on this campus." }, { status: 404 });
    }
    const allAttendance = await prisma.attendance.findMany({
      where: {
        classSession: {
          teacherId: teacherProfile.id,
        },
      },
      select: {
        status: true,
        markedAt: true,
        user: { select: { id: true, name: true } },
        classSession: { select: { subjectRel: { select: { name: true } } } },
      },
    });

    if (allAttendance.length === 0) {
      return NextResponse.json({ success: true, analytics: null, message: "No attendance data available yet." });
    }
    const subjectStats: { [subjectName: string]: { present: number; total: number } } = {};
    const studentStats: { [studentId: string]: { name: string; present: number; total: number } } = {};
    const attendanceTrend: { [date: string]: { present: number; total: number } } = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let overallPresent = 0;
    let overallTotal = 0;

    for (const record of allAttendance) {
      if (!record.user || !record.classSession?.subjectRel) continue;

      const subjectName = record.classSession.subjectRel.name;
      const studentId = record.user.id;
      const studentName = record.user.name;

      if (!subjectStats[subjectName]) subjectStats[subjectName] = { present: 0, total: 0 };
      if (!studentStats[studentId]) studentStats[studentId] = { name: studentName, present: 0, total: 0 };
      
      subjectStats[subjectName].total++;
      studentStats[studentId].total++;
      overallTotal++;

      if (record.status === "PRESENT" || record.status === "LATE") {
        subjectStats[subjectName].present++;
        studentStats[studentId].present++;
        overallPresent++;
      }

      //! Aggregate trend data for the last 30 days
      if (record.markedAt && record.markedAt > thirtyDaysAgo) {
          const dateString = record.markedAt.toISOString().split('T')[0];
          if(!attendanceTrend[dateString]) attendanceTrend[dateString] = { present: 0, total: 0 };
          attendanceTrend[dateString].total++;
          if (record.status === "PRESENT" || record.status === "LATE") {
            attendanceTrend[dateString].present++;
          }
      }
    }

    const overallAttendancePercentage = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0;
    
    const performanceBySubject = Object.entries(subjectStats).map(([subject, { present, total }]) => ({
        subject,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    })).sort((a,b) => b.percentage - a.percentage);

    const studentPerformance = Object.values(studentStats).map(({ name, present, total }) => ({
        name,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    }));
    
    const highestAttendingStudent = [...studentPerformance].sort((a,b) => b.percentage - a.percentage)[0] || null;
    const lowestAttendingStudent = [...studentPerformance].sort((a,b) => a.percentage - b.percentage)[0] || null;

    const dailyTrend = Object.entries(attendanceTrend).map(([date, { present, total }]) => ({
        date,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    return NextResponse.json({
      success: true,
      analytics: {
        overallAttendancePercentage,
        performanceBySubject,
        highestAttendingStudent,
        lowestAttendingStudent,
        dailyTrend,
      },
    });
  } catch (error) {
    console.error("Error fetching attendance analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics." }, { status: 500 });
  }
}