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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Add campusId to every 'where' clause to scope the counts.
    const [total, exams, holidays, others] = await Promise.all([
      prisma.event.count({
        where: { date: { gte: today }, campusId: campusId },
      }),
      prisma.event.count({
        where: { date: { gte: today }, type: "EXAM", campusId: campusId },
      }),
      prisma.event.count({
        where: { date: { gte: today }, type: "HOLIDAY", campusId: campusId },
      }),
      prisma.event.count({
        where: { date: { gte: today }, type: "EVENT", campusId: campusId },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalEvents: total,
          exams,
          holidays,
          others,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching event stats:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}