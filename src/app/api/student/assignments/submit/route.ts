import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assignmentId, studentId, content, fireUrl } = body;
    if (!assignmentId || !studentId) {
      return NextResponse.json(
        { error: "Missing required fields!!" },
        { status: 400 },
      );
    }
    if (!content?.trim() && !fireUrl) {
      return NextResponse.json(
        { error: "Submission must contain either text content or a file URL." },
        { status: 400 },
      );
    }
    const studentProfile = await prisma.student.findFirst({
      where: {
        OR: [{ userId: studentId }, { id: studentId }],
      },
    });
    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found!" },
        { status: 404 },
      );
    }

    //? (A. Vanshika) First Check:  Verify Assigment and Due date....
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found!" },
        { status: 404 },
      );
    }
    //! removed as we are also taking the late submissions - Vaibhav
    // if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
    //   return NextResponse.json(
    //     { error: "Due date have been passed for this Assignment! " },
    //     { status: 403 },
    //   );
    // }

    //? (A. Vanshika) Second  Check: Double Submission Check....
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId: assignmentId,
        studentId: studentProfile.id,
      },
    });
    if (existingSubmission) {
      return NextResponse.json(
        {
          error: "Assignment Already Submitted",
        },
        { status: 400 },
      );
    }
    const newSubmission = await prisma.submission.create({
      data: {
        assignmentId: assignmentId,
        studentId: studentProfile.id,
        text: content || null,
        fileUrl: fireUrl || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Assignment submitted successfully",
        submission: newSubmission,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
