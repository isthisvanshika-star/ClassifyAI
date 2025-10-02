import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 1. Get the campusId from the URL query parameters.
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get('campusId');

    if (!campusId) {
      return NextResponse.json(
        { success: false, error: "Campus ID is required" },
        { status: 400 }
      );
    }

    const subjects = await prisma.subject.findMany({
      // 2. Add a 'where' clause to filter subjects by the provided campusId.
      where: {
        campusId: campusId,
      },
      orderBy: {
        name: 'asc'
      },
    });
    
    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}