import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campusId = searchParams.get("campusId");

    const semesters = await prisma.semester.findMany({
      where: {
        campusId: campusId || undefined,
      },
    });

    return NextResponse.json(semesters);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch semesters" },
      { status: 500 }
    );
  }
}