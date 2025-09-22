import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 1. Get the campusId from the URL query parameters
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get('campusId');

    if (!campusId) {
      return NextResponse.json({ success: false, error: "Campus ID is required" }, { status: 400 });
    }
    
    // 2. Add campusId to every 'where' clause to scope the counts
    const [
      totalUsers,
      premiumUsers,
      proUsers,
      ultimateUsers,
      expiredPremiums,
    ] = await Promise.all([
      prisma.user.count({ where: { campusId } }),
      prisma.user.count({
        where: {
          campusId,
          OR: [
            { premiumFeatures: { some: {} } },
            { premiumExpiresAt: { not: null } },
          ],
        },
      }),
      prisma.user.count({
        where: {
          campusId,
          premiumFeatures: { some: { name: "STUDY_PLAN" } },
        },
      }),
      prisma.user.count({
        where: {
          campusId,
          premiumFeatures: { some: { name: "CALENDAR_SYNC" } },
        },
      }),
      prisma.user.count({
        where: {
          campusId,
          premiumExpiresAt: { lt: new Date() },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        premiumUsers,
        proUsers,
        ultimateUsers,
        expiredPremiums,
      },
    });
  } catch (err) {
    console.error("Error fetching user stats:", err);
    return NextResponse.json(
      { success: false, message: "Failed to get stats" },
      { status: 500 }
    );
  }
}