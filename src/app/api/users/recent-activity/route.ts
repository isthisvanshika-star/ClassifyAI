import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 1. Get the campusId from the URL query parameters.
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get('campusId');

    if (!campusId) {
      return NextResponse.json(
        { success: false, error: "Campus ID is required" },
        { status: 400 }
      );
    }

    const activities = await prisma.recentActivity.findMany({
      where: {
        user: {
          campusId: campusId,
        },
        action: {
          contains: "bought",
        },
      },
      orderBy: { timestamp: "desc" },
      take: 10,
    });

    const result = activities.map((a) => ({
      id: a.id,
      username: a.userName,
      text: a.action,
      date: a.timestamp.toISOString().split("T")[0],
    }));

    return NextResponse.json({ success: true, activities: result });
  } catch (err) {
    console.error("Error fetching recent premium activity:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch recent premium activity" },
      { status: 500 }
    );
  }
}