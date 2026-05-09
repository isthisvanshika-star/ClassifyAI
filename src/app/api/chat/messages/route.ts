import { prisma } from "@/lib/prisma";
import { pusherServer, Channels, Events } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";
import { canDM } from "@/lib/rbac";
import { Role } from "@/generated/prisma";
import { z } from "zod";

const sendMessageSchema = z.object({
  conversationId: z.string(),
  senderId: z.string(),
  encryptedContent: z.string(),
  replyToId: z.string().nullable().optional(),
  encryptedKeys: z.array(
    z.object({
      recipientId: z.string(),
      encryptedKey: z.string(),
    }),
  ),
  attachmentIds: z.array(z.string()).optional(),
});

const editMessageSchema = z.object({
  messageId: z.string(),
  conversationId: z.string(),
  userId: z.string(),
  encryptedContent: z.string(),
  encryptedKeys: z.array(
    z.object({
      recipientId: z.string(),
      encryptedKey: z.string(),
    }),
  ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = sendMessageSchema.parse(body);

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: data.conversationId,
          userId: data.senderId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: data.conversationId },
      select: {
        type: true,
        isTeacherOnly: true,
        participants: {
          select: { userId: true, user: { select: { role: true } } },
        },
      },
    });
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }
    if (conversation.isTeacherOnly) {
      const senderRole = conversation.participants.find(
        (p) => p.userId === data.senderId,
      )?.user.role;
      if (senderRole! == "TEACHER") {
        return NextResponse.json(
          { error: "Only teachers can send messages in this group" },
          { status: 403 },
        );
      }
    }

    const message = await prisma.$transaction(async (tx) => {
      const newMessage = await tx.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          encryptedContent: data.encryptedContent,
          replyToId: data.replyToId || null,
          encryptedKeys: {
            create: data.encryptedKeys.map(({ recipientId, encryptedKey }) => ({
              recipientId,
              encryptedKey,
            })),
          },
          ...(data.attachmentIds?.length && {
            attachments: {
              connect: data.attachmentIds.map((id) => ({ id })),
            },
          }),
        },
        include: {
          sender: {
            select: { id: true, name: true, avatarUrl: true },
          },
          encryptedKeys: true,
          attachments: true,
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          replyTo: {
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
              encryptedKeys: true,
            },
          },
        },
      });

      await tx.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() },
      });

      return newMessage;
    });

    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId: data.conversationId },
      select: { userId: true },
    });

    await pusherServer.trigger(
      Channels.conversation(data.conversationId),
      Events.NEW_MESSAGE,
      message,
    );

    const recipients = participants.filter((p) => p.userId !== data.senderId);

    await Promise.all(
      recipients.map(async ({ userId }) => {
        await prisma.notification.create({
          data: {
            userId,
            title: "New Message",
            body: `${message.sender.name} sent you a message`,
            meta: {
              conversationId: data.conversationId,
              messageId: message.id,
              link: `/chat?conversationId=${data.conversationId}`,
            },
          },
        });

        await pusherServer.trigger(
          Channels.notifications(userId),
          Events.NEW_NOTIFICATION,
          {
            title: "New Message",
            body: `${message.sender.name} sent you a message`,
            link: `/chat?conversationId=${data.conversationId}`,
          },
        );
      }),
    );

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    console.error("Send message error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const data = editMessageSchema.parse(body);
    const existing = await prisma.message.findUnique({
      where: { id: data.messageId },
      select: { senderId: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    if (existing.senderId !== data.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    //? removing old encrypted keys
    await prisma.messageKey.deleteMany({
      where: {
        messageId: data.messageId,
      },
    });

    const updated = await prisma.message.update({
      where: {
        id: data.messageId,
      },
      data: {
        encryptedContent: data.encryptedContent,
        editedAt: new Date(),

        encryptedKeys: {
          create: data.encryptedKeys.map((k) => ({
            recipientId: k.recipientId,
            encryptedKey: k.encryptedKey,
          })),
        },
      },

      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },

        encryptedKeys: true,
        attachments: true,

        replyTo: {
          include: {
            sender: true,
            encryptedKeys: true,
          },
        },
      },
    });

    await pusherServer.trigger(
      Channels.conversation(data.conversationId),
      Events.MESSAGE_UPDATED,
      updated,
    );
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Edit Message error", error);
    return NextResponse.json(
      { error: "Internal Server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    const userId = searchParams.get("userId");
    const cursor = searchParams.get("cursor");
    const limit = 30;

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: "conversationId and userId are required" },
        { status: 400 },
      );
    }

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        pinnedMessage: {
          include: {
            sender: true,
            attachments: true,
            encryptedKeys: true,
            replyTo: {
              include: {
                sender: true,
                encryptedKeys: true,
              },
            },
          },
        },
      },
    });

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
        ...(cursor && { createdAt: { lt: new Date(cursor) } }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
        encryptedKeys: {
          where: { recipientId: userId },
          select: { encryptedKey: true, recipientId: true },
        },
        attachments: true,
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            encryptedKeys: true,
          },
        },
      },
    });

    const nextCursor =
      messages.length === limit
        ? messages[messages.length - 1].createdAt.toISOString()
        : null;

    return NextResponse.json({
      messages: messages.reverse(),
      nextCursor,
      pinnedMessage: conversation?.pinnedMessage || null,
    });
  } catch (err) {
    console.error("Get messages error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("messageId");
    const userId = searchParams.get("userId");
    const conversationId = searchParams.get("conversationId");

    if (!messageId || !userId || !conversationId) {
      return NextResponse.json(
        { error: "messageId, userId and conversationId are required" },
        { status: 400 },
      );
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { senderId: true },
    });

    if (!message) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (message.senderId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      //? delete message....
      await tx.message.update({
        where: { id: messageId },
        data: { deletedAt: new Date() },
      });
      //? remove pin if pinned message delete....
      const conversation = await tx.conversation.findUnique({
        where: { id: conversationId },
        select: { pinnedMessageId: true },
      });
      if (conversation?.pinnedMessageId === messageId) {
        await tx.conversation.update({
          where: { id: conversationId },
          data: { pinnedMessageId: null },
        });
      }
      //? realtime unpin event....
      await pusherServer.trigger(
        Channels.conversation(conversationId),
        Events.PINNED_MESSAGE_UPDATED,
        {
          pinnedMessage: null,
        },
      );
    });

    await pusherServer.trigger(
      Channels.conversation(conversationId),
      Events.MESSAGE_DELETED,
      { messageId },
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete message error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
