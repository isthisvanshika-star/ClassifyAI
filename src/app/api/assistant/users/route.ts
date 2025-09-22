import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // 1. Get both role and campusId from the URL query parameters.
    const userRole = searchParams.get("role");
    const campusId = searchParams.get("campusId");

    if (!userRole || !campusId) {
      return NextResponse.json({ error: "Role and Campus ID are required" }, { status: 400 });
    }

    if (userRole !== "STUDENT" && userRole !== "TEACHER") {
      return NextResponse.json(
        { error: "Invalid role. Must be STUDENT or TEACHER." },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      // 2. Add campusId to the 'where' clause to filter the results.
      where: {
        role: userRole,
        campusId: campusId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        premiumFeatures: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // This logic to derive the 'isPremium' flag remains correct.
    const formattedUsers = users.map((u) => ({
      ...u,
      isPremium: u.premiumFeatures.length > 0,
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users." },
      { status: 500 }
    );
  }
}