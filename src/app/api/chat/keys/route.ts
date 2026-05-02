import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, conversationId, publicKey } = await req.json();
    if (!userId || !conversationId || !publicKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }
    const participant = await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { publicKey },
    });
    return NextResponse.json(participant);
  } catch (error) {
    console.error("Key register error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const conversationId = searchParams.get("conversationId");
    if (!userId || !conversationId) {
      return NextResponse.json(
        { error: "userId and conversationId required" },
        { status: 400 },
      );
    }
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      select: { publicKey: true },
    });
    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ publicKey: participant.publicKey });
  } catch (error) {
    console.error("Key fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
