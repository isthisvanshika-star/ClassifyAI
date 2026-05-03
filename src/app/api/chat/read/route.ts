import { prisma } from "@/lib/prisma";
import { pusherServer, Channels, Events } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const { conversationId, userId } = await req.json();

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: "conversationId and userId are required" },
        { status: 400 },
      );
    }

    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      data: { lastReadAt: new Date() },
    });

    await pusherServer.trigger(
      Channels.conversation(conversationId),
      Events.READ_RECEIPT,
      { userId, readAt: new Date().toISOString() },
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Read receipt error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
