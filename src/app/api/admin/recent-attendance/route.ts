import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Fetch the detailed data from the database
    const recentAttendanceData = await prisma.attendance.findMany({
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

    // 2. Transform the data, now including the date
    const simplifiedRecent = recentAttendanceData.map((attendance) => ({
      id: attendance.id,
      studentName: attendance.student?.user?.name ?? "Unknown Student",
      subjectName: attendance.classSession?.subjectRel?.name ?? "Unknown Subject",
      status: attendance.status,
      date: attendance.markedAt, // ADDED: The date the attendance was marked
    }));

    // 3. Return the new, simplified array
    return NextResponse.json({ success: true, recent: simplifiedRecent }, { status: 200 });

  } catch (error) {
    console.error("Error fetching recent attendance:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}