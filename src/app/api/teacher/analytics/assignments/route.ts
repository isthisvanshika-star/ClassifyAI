import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId"); // Teacher User ID
    const campusId = searchParams.get("campusId");

    if (!teacherId || !campusId) {
      return NextResponse.json({ error: "Teacher ID and Campus ID are required" }, { status: 400 });
    }

    // 1. AUTHORIZATION: Verify the teacher exists and belongs to the specified campus
    const teacherProfile = await prisma.teacher.findFirst({
      where: { userId: teacherId, user: { campusId: campusId } },
      select: { id: true },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: "Teacher not found on this campus." }, { status: 404 });
    }

    // 2. DATA FETCHING: Get all assignments and their graded submissions for this teacher
    const assignments = await prisma.assignment.findMany({
      where: { teacherId: teacherProfile.id },
      include: {
        subject: { select: { name: true } },
        submissions: {
          where: { grade: { not: null } }, // Only include graded submissions for analytics
          select: {
            grade: true,
            student: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    // 3. DATA PROCESSING: Calculate the analytics on the server
    const subjectPerformance: { [subjectName: string]: { totalGrade: number; count: number; averageGrade?: number; } } = {};
    const studentTrends: { [studentId: string]: { studentName: string; grades: number[]; } } = {};
    let totalGradedSubmissions = 0;

    for (const assignment of assignments) {
      const subjectName = assignment.subject.name;

      for (const submission of assignment.submissions) {
        if (submission.grade === null) continue;

        totalGradedSubmissions++;

        // Aggregate data for subject performance
        if (!subjectPerformance[subjectName]) {
          subjectPerformance[subjectName] = { totalGrade: 0, count: 0 };
        }
        subjectPerformance[subjectName].totalGrade += submission.grade;
        subjectPerformance[subjectName].count++;

        // Aggregate data for student trends
        const studentId = submission.student.user.id;
        const studentName = submission.student.user.name;
        if (!studentTrends[studentId]) {
          studentTrends[studentId] = { studentName, grades: [] };
        }
        studentTrends[studentId].grades.push(submission.grade);
      }
    }

    // Finalize subject average calculations
    for (const subject in subjectPerformance) {
      const { totalGrade, count } = subjectPerformance[subject];
      subjectPerformance[subject].averageGrade = parseFloat((totalGrade / count).toFixed(2));
    }
    
    // Convert maps to arrays for the response
    const performanceBySubject = Object.entries(subjectPerformance).map(([subject, data]) => ({ subject, averageGrade: data.averageGrade }));
    const trendsByStudent = Object.values(studentTrends);


    // 4. RETURN the structured data
    return NextResponse.json({
      success: true,
      analytics: {
        totalAssignments: assignments.length,
        totalGradedSubmissions,
        performanceBySubject,
        trendsByStudent,
      },
    });
  } catch (error) {
    console.error("Error fetching assignment analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics." }, { status: 500 });
  }
}