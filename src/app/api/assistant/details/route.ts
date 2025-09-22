import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const assistantId = request.nextUrl.searchParams.get('assistantId');

    if (!assistantId) {
        return NextResponse.json({ error: "Assistant ID is required" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { id: assistantId },
      select: { id: true, name: true, role: true, campusId: true },
    });

    if (!user) {
        return NextResponse.json({ error: "Assistant not found" }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error("Failed to fetch admin details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}