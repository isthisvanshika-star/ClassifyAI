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

    // 2. Add a comprehensive 'where' clause to filter by campus and premium status in one database call.
    // This is much more efficient than fetching all users first.
    const premiumUsers = await prisma.user.findMany({
      where: {
        campusId: campusId,
        OR: [
          { premiumFeatures: { some: {} } },
          { premiumExpiresAt: { not: null } },
        ],
      },
      include: {
        premiumFeatures: true,
      },
      orderBy: {
          premiumExpiresAt: 'asc' // Order by expiration date
      }
    });

    // 3. The data transformation logic remains the same.
    const result = premiumUsers.map((user) => {
      let plan = "PREMIUM";
      if (user.premiumFeatures.some((f: { name: string }) => f.name === "CALENDAR_SYNC")) {
        plan = "ULTIMATE";
      } else if (user.premiumFeatures.some((f: { name: string }) => f.name === "STUDY_PLAN")) {
        plan = "PRO";
      }

      const now = new Date();
      const status =
        user.premiumExpiresAt && user.premiumExpiresAt < now
          ? "EXPIRED"
          : "ACTIVE";

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        plan,
        startDate: user.createdAt.toISOString().split("T")[0],
        endDate: user.premiumExpiresAt
          ? user.premiumExpiresAt.toISOString().split("T")[0]
          : null,
        status,
      };
    });

    return NextResponse.json({ success: true, users: result }, { status: 200 });
  } catch (err) {
    console.error("Error fetching premium users:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch premium users" },
      { status: 500 }
    );
  }
}