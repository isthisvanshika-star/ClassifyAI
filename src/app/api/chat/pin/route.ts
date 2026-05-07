import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, messageId } = body;
    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation required" },
        { status: 400 },
      );
    }
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        pinnedMessageId: messageId || null,
      },
      include: {
        pinnedMessage: {
          include: {
            sender: true,
            attachments: true,
            encryptedKeys: true,
          },
        },
      },
    });
    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.error("Pin Message Error", error);
    return NextResponse.json(
      { error: "Failed to pin message" },
      { status: 500 },
    );
  }
}
