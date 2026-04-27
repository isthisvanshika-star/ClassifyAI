import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const campus = await prisma.campus.findUnique({
      where: { id: params.id },
    });

    if (!campus) {
      return NextResponse.json(
        { error: "Campus not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(campus);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch campus" },
      { status: 500 }
    );
  }
}