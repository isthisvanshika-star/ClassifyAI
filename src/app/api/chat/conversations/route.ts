import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { canDM, canCreateGroup, validateGroupParticipants } from "@/lib/rbac";
import { Role } from "@/generated/prisma";
import z from "zod";

const createConversationSchema = z.object({
  type: z.enum(["DIRECT", "GROUP"]),
  name: z.string().optional(), // required for GROUP
  campusId: z.string(),
  creatorId: z.string(),
  participantIds: z.array(z.string()).min(1),
  isTeacherOnly: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createConversationSchema.parse(body);

    if (data.type === "GROUP" && !data.name) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 },
      );
    }

    const creator = await prisma.user.findUnique({
      where: { id: data.creatorId },
      select: { role: true },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const creatorRole = creator.role as Role;

    if (data.type === "DIRECT") {
      const targetUser = await prisma.user.findUnique({
        where: { id: data.participantIds[0] },
        select: { role: true },
      });
      if (!targetUser) {
        return NextResponse.json(
          {
            error: "Target user not found",
          },
          { status: 404 },
        );
      }
      if (!canDM(creatorRole, targetUser.role as Role)) {
        return NextResponse.json(
          {
            error: `${creatorRole} is not  allowed to send direct messages to ${targetUser.role}`,
          },
          { status: 403 },
        );
      }
    }

    if (data.type === "GROUP") {
      if (!canCreateGroup(creatorRole)) {
        return NextResponse.json(
          {
            error: `${creatorRole} is allowed to create groups`,
          },
          { status: 403 },
        );
      }
      const participants = await prisma.user.findMany({
        where: { id: { in: data.participantIds } },
        select: { role: true },
      });
      const participantRoles = participants.map((p) => p.role as Role);
      const { valid, reason } = validateGroupParticipants(
        creatorRole,
        participantRoles,
        data.isTeacherOnly ?? false,
      );

      if (!valid) {
        return NextResponse.json({ error: reason }, { status: 403 });
      }
    }

    //? For DIRECT chats, ensure exactly 1 other participant is provided.....
    if (data.type === "DIRECT") {
      if (data.participantIds.length !== 1) {
        return NextResponse.json(
          { error: "Direct chat requires exactly 1 other participant" },
          { status: 400 },
        );
      }
      const allIds = [data.creatorId, data.participantIds[0]].sort();

      //? check if direct conversation already exists between these two....
      const existing = await prisma.conversation.findFirst({
        where: {
          type: "DIRECT",
          campusId: data.campusId,
          participants: {
            every: { userId: { in: allIds } },
          },
        },
        include: { participants: true },
      });
      //?  return existing instead of creating duplicate....
      if (existing && existing.participants.length === 2) {
        return NextResponse.json(existing, { status: 200 });
      }
    }
    //?  all participant IDs including creator....
    const allParticipantIds = [data.creatorId, ...data.participantIds];

    const conversation = await prisma.conversation.create({
      data: {
        type: data.type,
        name: data.name,
        campusId: data.campusId,
        isTeacherOnly: data.isTeacherOnly ?? false,
        participants: {
          create: allParticipantIds.map((userId) => ({
            userId,
            publicKey: "", //? will be updated when user registers their key
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true, role: true },
            },
          },
        },
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId } },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true, role: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // last message preview
          include: {
            encryptedKeys: {
              where: { recipientId: userId },
              select: { encryptedKey: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    //? attach unread count per conversation....
    const withUnread = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find((p) => p.userId === userId);
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            createdAt: { gt: participant?.lastReadAt ?? new Date(0) },
            senderId: { not: userId },
            deletedAt: null,
          },
        });
        return { ...conv, unreadCount };
      }),
    );

    return NextResponse.json(withUnread);
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
