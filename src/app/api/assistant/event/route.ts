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

    const today = new Date();

    const events = await prisma.event.findMany({
      // 2. Add campusId to the 'where' clause to filter the results.
      where: {
        campusId: campusId, // Only get events for this campus
        date: {
          gte: today,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json({ success: true, events }, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}