import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campusId = searchParams.get("campusId");

    const teachers = await prisma.teacher.findMany({
      where: {
        user: { campusId: campusId || undefined },
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(teachers);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}