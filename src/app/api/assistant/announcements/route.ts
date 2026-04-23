import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get("campusID");
    const assistantId = searchParams.get("assistantId");
    if (!campusId || !assistantId) {
      return NextResponse.json(
        { success: false, error: "Missing authentication parameters" },
        { status: 400 },
      );
    }
    const assistant = await prisma.user.findFirst({
      where: { id: assistantId, role: "ASSISTANT" },
      select: { id: true },
    });
    if (!assistant) {
      return NextResponse.json(
        { success: false, error: "Assistant not found on this campus." },
        { status: 404 },
      );
    }
    const announcements = await prisma.announcement.findMany({
      where: { author: { user: { campusId } } },
      include: {
        author: {
          include: { user: { select: { name: true, avatarUrl: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch announcements" },
      { status: 500 },
    );
  }
}
