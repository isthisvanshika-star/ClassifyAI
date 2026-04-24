import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get('campusId');

    if (!campusId) {
      return NextResponse.json(
        { success: false, error: "Campus ID is required" },
        { status: 400 }
      );
    }

    const semesters = await prisma.semester.findMany({
      where: {
        campusId: campusId,
      },
      orderBy: {
        name: 'asc'
      },
    });
    
    return NextResponse.json(semesters);
  } catch (error) {
    console.error("Error fetching semesters:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch semesters" },
      { status: 500 }
    );
  }
}