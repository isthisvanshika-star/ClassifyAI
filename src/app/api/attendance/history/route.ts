import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // 1. Get campusId and pagination params from the URL
    const studentId = searchParams.get("studentId");
    const campusId = searchParams.get("campusId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    if (!studentId || !campusId) {
      return NextResponse.json(
        { success: false, error: "Student ID and Campus ID are required" },
        { status: 400 }
      );
    }

    // 2. Build the secure, scoped where clause
    const whereClause = {
      userId: studentId,
      user: {
        campusId: campusId,
      },
      classSession: {
        isNot: null,
      },
    };

    // 3. Fetch data and total count in a single transaction for efficiency
    const [history, totalRecords] = await prisma.$transaction([
      prisma.attendance.findMany({
        where: whereClause,
        include: {
          classSession: {
            select: {
              subject: true,
              subjectRel: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          markedAt: "desc",
        },
        skip: skip,
        take: limit,
      }),
      prisma.attendance.count({
        where: whereClause,
      }),
    ]);

    const formattedHistory = history.map((item) => ({
      id: item.id,
      status: item.status,
      markedAt: item.markedAt,
      subject:
        item.classSession?.subjectRel?.name ||
        item.classSession?.subject ||
        "Unknown Subject",
    }));
    
    // 4. Return the paginated response
    return NextResponse.json({
      success: true,
      history: formattedHistory,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching attendance history" },
      { status: 500 }
    );
  }
}