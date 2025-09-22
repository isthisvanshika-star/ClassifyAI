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
      // 2. Add a 'where' clause to filter activities by the provided campusId.
      // This ensures an admin can only see activity from their own campus.
      where: {
        user: {
          campusId: campusId,
        },
      },
      take: 10,
      orderBy: { timestamp: "desc" },
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, activities }, { status: 200 });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recent activity" },
      { status: 500 }
    );
  }
}