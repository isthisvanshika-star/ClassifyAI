import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId"); // This is the Teacher User ID
    const campusId = searchParams.get("campusId");
    const date = searchParams.get("date");
    const subjectId = searchParams.get("subjectId");
    const semesterId = searchParams.get("semesterId");
    const sectionId = searchParams.get("sectionId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

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
    const whereClause: any = {
      classSession: {
        teacherId: teacherProfile.id,
        campusId: campusId,
      },
    };

    if (date) {
        const attendanceDate = new Date(date);
        const startOfDay = new Date(attendanceDate.setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(attendanceDate.setUTCHours(23, 59, 59, 999));
        whereClause.markedAt = { gte: startOfDay, lt: endOfDay };
    }
    if (subjectId) {
        whereClause.classSession.subjectId = subjectId;
    }
    if (semesterId) {
        whereClause.classSession.semesterId = semesterId;
    }
    if (sectionId) {
        whereClause.classSession.sectionId = sectionId;
    }
    const [records, totalRecords] = await prisma.$transaction([
      prisma.attendance.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { markedAt: "desc" },
        include: {
          user: { select: { name: true } },
          classSession: {
            include: {
              subjectRel: { select: { name: true } },
            },
          },
        },
      }),
      prisma.attendance.count({ where: whereClause }),
    ]);

    const formattedRecords = records.map(rec => ({
        id: rec.id,
        studentName: rec.user?.name || 'Unknown',
        subjectName: rec.classSession?.subjectRel?.name || 'Unknown',
        status: rec.status,
        markedAt: rec.markedAt,
    }));

    return NextResponse.json({
      success: true,
      attendance: formattedRecords,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords,
      },
    });

  } catch (error) {
    console.error("Error fetching past attendance:", error);
    return NextResponse.json({ error: "Failed to fetch attendance records." }, { status: 500 });
  }
}