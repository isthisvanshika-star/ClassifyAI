import { prisma } from "@/lib/prisma";
import { pusherServer, Channels, Events } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const sendMessageSchema = z.object({
  senderId: z.string(),
  encryptedContent: z.string(),
  encryptedKeys: z.array(
    z.object({
      recipientId: z.string(),
      encryptedKey: z.string(),
    }),
  ),
  attachmentIds: z.array(z.string()).optional(),
});

//? SEND MESSAGE....
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const conversationId = params.id;
    const body = await req.json();
    const data = sendMessageSchema.parse(body);

    //? verify sender is a participant....
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: data.senderId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    //? create message + all encrypted keys in one transaction....
    const message = await prisma.$transaction(async (tx) => {
      const newMessage = await tx.message.create({
        data: {
          conversationId,
          senderId: data.senderId,
          encryptedContent: data.encryptedContent,
          encryptedKeys: {
            create: data.encryptedKeys.map(({ recipientId, encryptedKey }) => ({
              recipientId,
              encryptedKey,
            })),
          },
          //? link existing uploaded resources....
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
        },
      });

      //? bump conversation updatedAt for sorting....
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return newMessage;
    });

    //? get all participants to notify....
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId },
      select: { userId: true },
    });

    //? trigger Pusher for real-time delivery....
    await pusherServer.trigger(
      Channels.conversation(conversationId),
      Events.NEW_MESSAGE,
      message,
    );

    //? save notification for each recipient + trigger their notification channel....
    const recipients = participants.filter((p) => p.userId !== data.senderId);

    await Promise.all(
      recipients.map(async ({ userId }) => {
        await prisma.notification.create({
          data: {
            userId,
            title: "New Message",
            body: `${message.sender.name} sent you a message`,
            meta: {
              conversationId,
              messageId: message.id,
              link: `/chat/${conversationId}`,
            },
          },
        });

        //? ping the user's private notification channel....
        await pusherServer.trigger(
          Channels.notifications(userId),
          Events.NEW_NOTIFICATION,
          {
            title: "New Message",
            body: `${message.sender.name} sent you a message`,
            link: `/chat/${conversationId}`,
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

//? GET MESSAGES WITH DECRYPTION INFO....
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const cursor = searchParams.get("cursor"); // for pagination
    const limit = 30;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    //? verify participant....
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: params.id,
          userId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: params.id,
        deletedAt: null,
        ...(cursor && { createdAt: { lt: new Date(cursor) } }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
        //? only return this user's encrypted key — not others....
        encryptedKeys: {
          where: { recipientId: userId },
          select: { encryptedKey: true },
        },
        attachments: true,
      },
    });

    const nextCursor =
      messages.length === limit
        ? messages[messages.length - 1].createdAt.toISOString()
        : null;

    return NextResponse.json({
      //? older first....
      messages: messages.reverse(),
      nextCursor,
    });
  } catch (err) {
    console.error("Get messages error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
