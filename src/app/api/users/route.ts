import { prisma } from "@/lib/prisma";
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

    const users = await prisma.user.findMany({
      where: {
        campusId,
        role: { in: ["STUDENT", "TEACHER", "ASSISTANT"] },
      },
      select: {
        id: true,
        name: true,
        role: true,
        avatarUrl: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
