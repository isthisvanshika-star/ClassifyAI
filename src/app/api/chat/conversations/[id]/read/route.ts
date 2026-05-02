import { prisma } from "@/lib/prisma";
import { pusherServer, Channels, Events } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: params.id,
          userId,
        },
      },
      data: { lastReadAt: new Date() },
    });

    //? notify other participants of read receipt....
    await pusherServer.trigger(
      Channels.conversation(params.id),
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
