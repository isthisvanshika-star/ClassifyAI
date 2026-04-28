//? (A. Vanshikha) This API route provides analytics data for the HOD dashboard including average attendance, total resources added this week, and classes conducted today..... It accepts a campusId as a query parameter and an optional date for testing purposes.... The response includes structured data for each metric, and errors are handled gracefully with appropriate status codes and messages.....

import { prisma } from "@/lib/prisma";
import { AttendanceStatus, SessionStatus } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const campusId = searchParams.get("campusId");
    if (!campusId) {
      return NextResponse.json(
        { error: "campusId is required" },
        { status: 400 },
      );
    }
    const nowParam = searchParams.get("date");
    const now = nowParam ? new Date(nowParam) : new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getDay(); // 0 = Sunday
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const [presentCount, totalResolvedCount] = await Promise.all([
      prisma.attendance.count({
        where: {
          status: { in: [AttendanceStatus.PRESENT, AttendanceStatus.LATE] },
          classSession: {
            campusId,
          },
        },
      }),
      prisma.attendance.count({
        where: {
          status: {
            in: [
              AttendanceStatus.PRESENT,
              AttendanceStatus.LATE,
              AttendanceStatus.ABSENT,
            ],
          },
          classSession: {
            campusId,
          },
        },
      }),
    ]);

    const attendancePercentage =
      totalResolvedCount > 0
        ? Math.round((presentCount / totalResolvedCount) * 100)
        : 0;

    const [weeklyNotes, weeklyPyqs] = await Promise.all([
      prisma.resource.count({
        where: {
          resourceType: "NOTES",
          createdAt: { gte: startOfWeek },
          subject: { campusId },
        },
      }),
      prisma.resource.count({
        where: {
          resourceType: "PYQ",
          createdAt: { gte: startOfWeek },
          subject: { campusId },
        },
      }),
    ]);

    const [classesToday, classesLive, classesUpcoming] = await Promise.all([
      prisma.classSession.count({
        where: {
          campusId,
          status: SessionStatus.COMPLETED,
          date: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.classSession.count({
        where: {
          campusId,
          status: SessionStatus.LIVE,
          date: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.classSession.count({
        where: {
          campusId,
          status: SessionStatus.UPCOMING,
          date: { gte: startOfDay, lte: endOfDay },
        },
      }),
    ]);

    return NextResponse.json({
      averageAttendance: {
        percentage: attendancePercentage,
        present: presentCount,
        total: totalResolvedCount,
      },
      totalResources: {
        thisWeek: weeklyNotes + weeklyPyqs,
        notes: weeklyNotes,
        pyqs: weeklyPyqs,
      },
      classesConducted: {
        today: classesToday,
        live: classesLive,
        upcoming: classesUpcoming,
      },
    });
  } catch (error) {
    console.error("[DEPARTMENT_PULSE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
