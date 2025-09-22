import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get("campusId");

    if (campusId) {
      const campus = await prisma.campus.findUnique({
        where: { id: campusId },
        select: {
          id: true,
          name: true,
          hindiName: true,
          slug: true,
          city: true,
          logoUrl: true,
        },
      });

      if (!campus) {
        return NextResponse.json(
          { error: "Campus not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(campus);
    }
    const campuses = await prisma.campus.findMany({
      select: {
        id: true,
        name: true,
        hindiName: true,
        slug: true,
        city: true,
        logoUrl: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(campuses);
  } catch (error) {
    console.error("Failed to fetch campuses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
