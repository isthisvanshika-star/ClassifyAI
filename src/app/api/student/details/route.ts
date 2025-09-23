import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // 1. Get both studentId (which is a userId) and campusId from the URL
    const studentId = searchParams.get("studentId");
    const campusId = searchParams.get("campusId");

    if (!studentId || !campusId) {
      return NextResponse.json(
        { error: "Student ID and Campus ID are required" },
        { status: 400 }
      );
    }

    // 2. Update the query to be a secure, scoped findFirst.
    // This finds a user only if their ID and campusId both match.
    const details = await prisma.user.findFirst({
      where: {
        id: studentId,
        campusId: campusId,
      },
      include: {
        premiumFeatures: true
      }
    });

    if (!details) {
        return NextResponse.json({ error: "Student not found on this campus." }, { status: 404 });
    }

    return NextResponse.json(details);
  } catch (error) {
    console.error("Error fetching student details:", error);
    return NextResponse.json(
      { error: "Failed to fetch student details" },
      { status: 500 }
    );
  }
}