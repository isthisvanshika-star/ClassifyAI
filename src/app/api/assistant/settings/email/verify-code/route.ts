import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Invalid code." }, { status: 400 });
  }

  const data = await redis.get("admin-email-verification");

  if (!data) {
    return NextResponse.json({ error: "Verification expired or not requested." }, { status: 400 });
  }

  const parsed = JSON.parse(data);

  if (parsed.code !== code) {
    return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
  }

  // Update admin email
  await prisma.user.updateMany({
    where: { role: "ADMIN" },
    data: { email: parsed.newEmail },
  });

  // Delete key
  await redis.del("admin-email-verification");

  return NextResponse.json({ success: true, message: "Admin email updated successfully." });
}
