import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");

    //* (A. Vanshika) For testing purposes.... storing studentId for a temprorary time in local storage and fetching it here to send it to backend for fetching assignment details..... In future.....we will implement proper authentication management for students.
    const studentId = searchParams.get("studentId"); 

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Database se assignment fetch karo
    const assignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
        // Security: Students ko sirf wo assignments dikhne chahiye jo Publish ho chuke hain
        status: { in: ["PUBLISHED", "CLOSED"] } 
      },
      include: {
        subject: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found or not published yet." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, assignment }, { status: 200 });

  } catch (error) {
    console.error("Error fetching assignment details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}