// src/app/api/chat/keys/init/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, publicKey } = await req.json();

    if (!userId || !publicKey) {
      return NextResponse.json(
        { error: "userId and publicKey are required" },
        { status: 400 }
      );
    }

    // update ALL conversations this user is part of in one query
    await prisma.conversationParticipant.updateMany({
      where: { userId },
      data: { publicKey },
    });

    // also handle future conversations — store public key on user level too
    // so when they're added to a NEW conversation we can auto-populate it
    await prisma.user.update({
      where: { id: userId },
      // we store it in a json meta field or we handle it in the
      // conversation creation route — see Step 3 below
      data: { updatedAt: new Date() }, // placeholder — see Step 3
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Key init error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}