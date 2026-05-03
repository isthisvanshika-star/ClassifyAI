import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const userId =
      request.headers.get("x-user-id") || params.get("userId") || null;
    if (!userId) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const socketId = params.get("socket_id")!;
    const channel = params.get("channel_name")!;

    if (channel.startsWith("private-chat-")) {
      const conversationId = channel.replace("private-chat-", "");
      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: { conversationId, userId: user.id },
        },
      });
      if (!participant) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const authResponse = pusherServer.authorizeChannel(socketId, channel);
      return NextResponse.json(authResponse);
    }

    if (channel.startsWith("presence-")) {
      const conversationId = channel.replace("presence-group-", "");
      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId: user.id,
          },
        },
      });

            if (!participant) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
        const authResponse = pusherServer.authorizeChannel(socketId, channel, {
        user_id: user.id,
        user_info: { name: user.name },
      });
      return NextResponse.json(authResponse);
    }
    return NextResponse.json(
      { error: "Invalid channel type" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Pusher auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
