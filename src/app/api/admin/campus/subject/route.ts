import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campusId = searchParams.get("campusId");

    const subjects = await prisma.subject.findMany({
      where: {
        campusId: campusId || undefined,
      },
    });

    return NextResponse.json(subjects);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}