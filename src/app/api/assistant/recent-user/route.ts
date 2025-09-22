import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // 1. Get both role and campusId from the URL query parameters
    const roleParam = searchParams.get("role");
    const campusId = searchParams.get("campusId");

    if (!roleParam || !campusId) {
      return NextResponse.json({ error: "Role and Campus ID are required" }, { status: 400 });
    }

    if (roleParam !== "STUDENT" && roleParam !== "TEACHER") {
      return NextResponse.json(
        { error: "Invalid role. Must be STUDENT or TEACHER." },
        { status: 400 }
      );
    }

    const role = roleParam;

    const user = await prisma.user.findFirst({
      // 2. Add campusId to the 'where' clause to scope the search
      where: {
        role: role,
        campusId: campusId,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: `No recent ${role.toLowerCase()} found for this campus` });
    }

    return NextResponse.json(user);
    
  } catch (error) {
      console.error("Error fetching recent user:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}