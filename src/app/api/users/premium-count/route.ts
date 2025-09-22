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

    const totalPremiums = await prisma.user.count({
      where: {
        campusId: campusId,
        OR: [
          { premiumFeatures: { some: {} } }, 
          { premiumExpiresAt: { not: null } }, 
        ],
      },
    });

    return NextResponse.json({ success: true, totalPremiums }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Failed to count premium users" },
      { status: 500 }
    );
  }
}