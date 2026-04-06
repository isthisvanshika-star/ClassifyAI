import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const studentId = searchParams.get("studentId");
    const campusId = searchParams.get("campusId");

    //? (A. Vanshika) Validate required params early....
    if (!studentId || !campusId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    //? (A. Vanshika) Step 1: Fetch student with semester & subjects....
    const studentInfo = await prisma.student.findUnique({
      where: { userId: studentId },
      include: {
        user: true, // to verify campus
        semester: {
          include: {
            teacherSubjects: {
              include: {
                subject: true, // get actual subjects
              },
            },
          },
        },
      },
    });

    //? (A. Vanshika) Step 2: Validate student existence & campus match....
    if (!studentInfo || !studentInfo.user) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    if (studentInfo.user.campusId !== campusId) {
      return NextResponse.json(
        { error: "Unauthorized campus access" },
        { status: 403 }
      );
    }

    if (!studentInfo.semester) {
      return NextResponse.json(
        { error: "Semester not assigned" },
        { status: 404 }
      );
    }

    //? (A. Vanshika) Step 3: Extract subject IDs from TeacherSubject mapping....
    const subjectIds =
      studentInfo.semester.teacherSubjects.map(
        (ts) => ts.subjectId
      ) || [];

    if (subjectIds.length === 0) {
      return NextResponse.json({
        success: true,
        resources: [],
      });
    }

    //? (A. Vanshika) Step 4: Fetch resources linked to these subjects....
    const resources = await prisma.resource.findMany({
      where: {
        subjectId: { in: subjectIds },
      },
      include: {
        subject: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    //? (A. Vanshika) Step 5: Return structured response....
    return NextResponse.json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error) {
    console.error("Error fetching student resources:", error);

    //? (A. Vanshika) Centralized error response....
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}