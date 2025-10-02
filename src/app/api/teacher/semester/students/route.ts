import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 1. Get campusId along with the other parameters.
    const semesterId = searchParams.get('semesterId');
    const sectionId = searchParams.get('sectionId');
    const campusId = searchParams.get('campusId');

    // Campus ID is now mandatory for security.
    if (!campusId) {
      return NextResponse.json(
        { message: "Campus ID is required" },
        { status: 400 }
      );
    }

    // Build the dynamic where clause.
    const whereClause: any = {
        // 2. Scope the query to the specific campus.
        user: {
            campusId: campusId
        }
    };
    if (semesterId) {
      whereClause.semesterId = semesterId;
    }
    if (sectionId) {
      whereClause.sectionId = sectionId;
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: { user: { name: 'asc' } }
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ message: "Failed to fetch students" }, { status: 500 });
  }
}