import { pusherServer, Channels, Events } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { conversationId, userId, isTyping } = await req.json();

    await pusherServer.trigger(
      Channels.conversation(conversationId),
      isTyping ? Events.TYPING_START : Events.TYPING_STOP,
      { userId }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Typing error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}