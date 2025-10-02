import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");
    const teacherId = searchParams.get("teacherId"); // Teacher User ID

    if (!assignmentId || !teacherId) {
      return NextResponse.json({ error: "Assignment ID and Teacher ID are required" }, { status: 400 });
    }

    // --- Authorization & Fetching Assignment ---
    const [assignment, teacherProfile] = await Promise.all([
        prisma.assignment.findUnique({ 
            where: { id: assignmentId },
        }),
        prisma.teacher.findUnique({ where: { userId: teacherId } })
    ]);
    
    if (!assignment || !teacherProfile || assignment.teacherId !== teacherProfile.id) {
        return NextResponse.json({ error: "Unauthorized or assignment not found." }, { status: 403 });
    }
    // --- End Authorization ---

    const submissions = await prisma.submission.findMany({
        where: { assignmentId: assignmentId },
        include: { student: { include: { user: { select: { name: true } } } } }
    });

    // --- FIX: Find the correct sectionId via the TeacherSubject link ---
    const teacherSubjectLink = await prisma.teacherSubject.findFirst({
        where: {
            teacherId: teacherProfile.id,
            subjectId: assignment.subjectId,
            // This assumes an assignment is for one section. If it can be for multiple, this logic would need to expand.
        },
        select: { sectionId: true }
    });
    
    if (!teacherSubjectLink || !teacherSubjectLink.sectionId) {
        return NextResponse.json({ error: "Could not determine the section for this assignment." }, { status: 404 });
    }
    const sectionId = teacherSubjectLink.sectionId;
    // --- END OF FIX ---

    // 1. Calculate Highest and Lowest Grades
    const gradedSubmissions = submissions.filter(s => s.grade !== null);
    let highestGrade = null;
    let lowestGrade = null;

    if (gradedSubmissions.length > 0) {
        const grades = gradedSubmissions.map(s => s.grade!);
        highestGrade = Math.max(...grades);
        lowestGrade = Math.min(...grades);
    }
    
    // 2. Find Students Who Have Not Submitted
    const allStudentsInSection = await prisma.student.findMany({
        where: { sectionId: sectionId }, // Use the correctly found sectionId
        select: { id: true, user: { select: { name: true } } }
    });

    const submittedStudentIds = new Set(submissions.map(s => s.studentId));
    const nonSubmitters = allStudentsInSection
        .filter(student => !submittedStudentIds.has(student.id))
        .map(student => ({ id: student.id, name: student.user.name }));

    return NextResponse.json({
      success: true,
      analytics: {
        submissionCount: submissions.length,
        totalStudents: allStudentsInSection.length,
        highestGrade,
        lowestGrade,
        nonSubmitters,
      },
    });
  } catch (error) {
    console.error("Error fetching assignment analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics." }, { status: 500 });
  }
}