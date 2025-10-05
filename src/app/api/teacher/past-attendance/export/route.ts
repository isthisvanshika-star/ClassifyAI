import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Parser } from "json2csv";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const campusId = searchParams.get("campusId");
    const date = searchParams.get("date");
    const subjectId = searchParams.get("subjectId");
    const semesterId = searchParams.get("semesterId");
    const sectionId = searchParams.get("sectionId");

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
      classSession: { teacherId: teacherProfile.id, campusId: campusId },
    };

    if (date) {
      const attendanceDate = new Date(date);
      const startOfDay = new Date(attendanceDate.setUTCHours(0, 0, 0, 0));
      const endOfDay = new Date(attendanceDate.setUTCHours(23, 59, 59, 999));
      whereClause.markedAt = { gte: startOfDay, lt: endOfDay };
    }
    if (subjectId) whereClause.classSession.subjectId = subjectId;
    if (semesterId) whereClause.classSession.semesterId = semesterId;
    if (sectionId) whereClause.classSession.sectionId = sectionId;

    const records = await prisma.attendance.findMany({
      where: whereClause,
      orderBy: { markedAt: "desc" },
      include: {
        user: { select: { name: true } },
        classSession: {
          include: { subjectRel: { select: { name: true } } },
        },
      },
    });

    const formattedRecords = records.map((rec) => ({
      studentName: rec.user?.name || "Unknown",
      subjectName: rec.classSession?.subjectRel?.name || "Unknown",
      status: rec.status,
      date: rec.markedAt ? new Date(rec.markedAt).toLocaleDateString() : "",
      time: rec.markedAt ? new Date(rec.markedAt).toLocaleTimeString() : "",
      remarks: rec.remarks || "",
    }));

    // Provide headers explicitly if no data
    const fields = ["studentName", "subjectName", "status", "date", "time", "remarks"];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(formattedRecords);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="attendance-export.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting attendance:", error);
    return NextResponse.json({ error: "Failed to export records." }, { status: 500 });
  }
}
