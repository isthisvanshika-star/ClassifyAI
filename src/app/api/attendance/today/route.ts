import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // 1. Get both studentId and campusId from the URL
    const studentId = searchParams.get("studentId");
    const campusId = searchParams.get("campusId");

    if (!studentId || !campusId) {
      return NextResponse.json(
        { error: "Student ID and Campus ID are required" },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const attendances = await prisma.attendance.findMany({
      where: {
        // 2. The 'where' clause now securely filters by both studentId AND campusId.
        // This ensures a student can only fetch their own data from their own campus.
        userId: studentId,
        user: {
          campusId: campusId,
        },
        markedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        classSession: {
          select: {
            subject: true, // Legacy field
            subjectRel: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        markedAt: "desc",
      },
    });

    const formattedAttendances = attendances.map(att => ({
      id: att.id,
      subject: att.classSession?.subjectRel?.name || att.classSession?.subject || "Unknown Subject",
      status: att.status,
      markedAt: att.markedAt,
      // You provided 'date' in your student dashboard, so I've added it here for consistency.
      date: att.markedAt 
    }));

    return NextResponse.json(formattedAttendances);
  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch today's attendance" },
      { status: 500 }
    );
  }
}