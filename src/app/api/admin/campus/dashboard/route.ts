import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Campus ID is required" },
        { status: 400 },
      );
    }
    const campus = await prisma.campus.findUnique({
      where: { id: id },
    });

    if (!campus) {
      return NextResponse.json({ error: "Campus not found" }, { status: 404 });
    }

    return NextResponse.json(campus);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch campus" },
      { status: 500 },
    );
  }
}
