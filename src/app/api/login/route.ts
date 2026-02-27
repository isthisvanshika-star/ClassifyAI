import { logActivity } from "@/lib/helper";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

export async function POST(req: Request) {
  const { email, name } = await req.json();
  if (!email || !name) {
    return NextResponse.json({ message: "Missing Fields" }, { status: 400 });
  }
  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (user.username !== name) {
      return NextResponse.json({ message: "Invalid username" }, { status: 401 });
    }
    const session = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.session.create({
      data: { sessionToken: session, userId: user.id, expiresAt },
    })
    ;(await cookies()).set("session-token",session,{
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "strict",
      path:"/"
    })
    await logActivity(
      user.id,
      user.name,
      `${user.name} (${user.role}) logged in to the ClassifyAI.`
    );
    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
