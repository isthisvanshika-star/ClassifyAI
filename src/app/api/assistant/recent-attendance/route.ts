import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 1. Get the campusId from the URL query parameters.
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get('campusId');

    if (!campusId) {
      return NextResponse.json({ success: false, error: "Campus ID is required" }, { status: 400 });
    }

    // 2. Fetch the detailed data, now filtered by the provided campusId.
    const recentAttendanceData = await prisma.attendance.findMany({
      where: {
        // This ensures you only get attendance for students of the specified campus.
        student: {
          user: {
            campusId: campusId,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        classSession: {
          include: {
            subjectRel: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // 3. Transform the data into the simple format for the frontend.
    const simplifiedRecent = recentAttendanceData.map((attendance) => ({
      id: attendance.id,
      studentName: attendance.student?.user?.name ?? "Unknown Student",
      subjectName: attendance.classSession?.subjectRel?.name ?? "Unknown Subject",
      status: attendance.status,
      date: attendance.markedAt,
    }));

    return NextResponse.json({ success: true, recent: simplifiedRecent }, { status: 200 });

  } catch (error) {
    console.error("Error fetching recent attendance:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}