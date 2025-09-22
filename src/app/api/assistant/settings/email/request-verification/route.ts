import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { sendMail } from "@/lib/mail"; // your SMTP helper

export async function POST(req: NextRequest) {
  const { newEmail } = await req.json();

  if (!newEmail || typeof newEmail !== "string") {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    return NextResponse.json({ error: "Admin user not found." }, { status: 404 });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // save to redis with TTL 10 min
  await redis.set(
    "admin-email-verification",
    JSON.stringify({ code, newEmail }),
    "EX",
    600
  );

  // send code to old + new email
  await Promise.all([
    sendMail(admin.email, "Admin Email Change Verification", code),
    sendMail(newEmail, "Admin Email Change Verification", code),
  ]);

  return NextResponse.json({ success: true, message: "Verification code sent to both emails." });
}
