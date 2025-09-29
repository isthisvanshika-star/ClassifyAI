import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // 1. Get both teacherId (which is a userId) and campusId from the URL
    const teacherId = searchParams.get("teacherId");
    const campusId = searchParams.get("campusId");

    if (!teacherId || !campusId) {
      return NextResponse.json(
        { error: "Teacher ID and Campus ID are required" },
        { status: 400 }
      );
    }

    // 2. Update the query to be a secure, scoped findFirst.
    // This finds a user only if their ID and campusId both match.
    const details = await prisma.user.findFirst({
      where: {
        id: teacherId,
        campusId: campusId,
      },
      include: {
        premiumFeatures: true,
      },
    });

    if (!details) {
      return NextResponse.json({ error: "Teacher not found on this campus." }, { status: 404 });
    }

    return NextResponse.json(details);
  } catch (error) {
    console.error("Error fetching teacher details:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher details" },
      { status: 500 }
    );
  }
}