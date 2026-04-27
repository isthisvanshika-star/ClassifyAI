import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campusId = searchParams.get("campusId");

    const students = await prisma.student.findMany({
      where: {
        user: { campusId: campusId || undefined },
      },
      include: {
        user: true,
        semester: true,
        section: true,
      },
    });

    return NextResponse.json(students);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}