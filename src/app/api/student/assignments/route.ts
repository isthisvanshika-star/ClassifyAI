import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId"); // This is the User ID
    const campusId = searchParams.get("campusId");

    if (!studentId || !campusId) {
      return NextResponse.json({ error: "Student ID and Campus ID are required" }, { status: 400 });
    }

    // 1. Verify the student exists on the specified campus and get their Student Profile ID.
    const studentUser = await prisma.user.findFirst({
      where: {
        id: studentId,
        campusId: campusId,
        role: "STUDENT",
      },
      include: {
        studentProfile: { select: { id: true } },
      },
    });

    if (!studentUser || !studentUser.studentProfile) {
      return NextResponse.json({ error: "Student not found on this campus." }, { status: 404 });
    }
    const studentProfileId = studentUser.studentProfile.id;

    // 2. Fetch all PUBLISHED assignments for that campus.
    const assignments = await prisma.assignment.findMany({
      where: {
        subject: {
          campusId: campusId,
        },
        status: "PUBLISHED",
      },
      include: {
        subject: { select: { name: true } },
        // 3. For each assignment, include the submission ONLY from the current student.
        submissions: {
          where: {
            studentId: studentProfileId,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      }
    });

    // 4. Format the data to include a clear submission status for the frontend.
    const formattedAssignments = assignments.map(assignment => {
      const submission = assignment.submissions[0]; // Will be undefined or have one item
      let submissionStatus = 'PENDING';
      
      if (submission) {
        submissionStatus = submission.grade !== null ? 'GRADED' : 'SUBMITTED';
      }

      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        totalMarks: assignment.totalMarks,
        subjectName: assignment.subject.name,
        submissionStatus,
        grade: submission?.grade, // Include grade if it exists
        feedback: submission?.feedback, // Include feedback if it exists
      };
    });

    return NextResponse.json({ success: true, assignments: formattedAssignments });
  } catch (error) {
    console.error("Error fetching student assignments:", error);
    return NextResponse.json({ error: "Failed to fetch assignments." }, { status: 500 });
  }
}