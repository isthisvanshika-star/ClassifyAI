import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { pusherServer, Channels } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { messageId, userId, emoji, conversationId } = body;

    if (!messageId || !userId || !emoji || !conversationId) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 },
      );
    }

    const existingReaction = await prisma.messageReaction.findFirst({
      where: {
        messageId,
        userId,
      },
    });

    // Same emoji clicked again -> remove
    if (existingReaction && existingReaction.emoji === emoji) {
      await prisma.messageReaction.delete({
        where: {
          id: existingReaction.id,
        },
      });
    }

    // Different emoji clicked -> replace
    else if (existingReaction && existingReaction.emoji !== emoji) {
      await prisma.messageReaction.update({
        where: {
          id: existingReaction.id,
        },
        data: {
          emoji,
        },
      });
    }

    // No reaction yet -> create
    else {
      await prisma.messageReaction.create({
        data: {
          messageId,
          userId,
          emoji,
        },
      });
    }

    // Always fetch latest reactions after mutation
    const reactions = await prisma.messageReaction.findMany({
      where: {
        messageId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    await pusherServer.trigger(
      Channels.conversation(conversationId),
      "reaction-updated",
      {
        messageId,
        reactions,
      },
    );

    return NextResponse.json({
      success: true,
      messageId,
      reactions,
    });
  } catch (err) {
    console.error("Reaction error:", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}