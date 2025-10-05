import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * GET: Fetches a list of all announcements created by a specific teacher.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId"); // This is the Teacher User ID
    const campusId = searchParams.get("campusId");

    if (!teacherId || !campusId) {
      return NextResponse.json({ error: "Teacher ID and Campus ID are required" }, { status: 400 });
    }

    // Securely find the teacher's profile ID
    const teacherProfile = await prisma.teacher.findFirst({
      where: { userId: teacherId, user: { campusId: campusId } },
      select: { id: true },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: "Teacher not found on this campus." }, { status: 404 });
    }

    const announcements = await prisma.announcement.findMany({
      where: { authorId: teacherProfile.id }, // Fetch announcements by this teacher
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ error: "Failed to fetch announcements." }, { status: 500 });
  }
}

/**
 * POST: Creates a new announcement.
 */
const createAnnouncementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  message: z.string().min(1, "Message is required."),
  targetAll: z.boolean().default(false),
  targetSemester: z.number().optional(), // semester number, e.g., 3
  targetSection: z.string().optional(), // section name, e.g., "A"
  teacherId: z.string().cuid(), // Teacher User ID
  campusId: z.string().cuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createAnnouncementSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { title, message, targetAll, targetSemester, targetSection, teacherId, campusId } = validation.data;

    // Authorization: Verify the teacher belongs to the campus
    const teacherProfile = await prisma.teacher.findFirst({
        where: { userId: teacherId, user: { campusId } }
    });
    if (!teacherProfile) {
        return NextResponse.json({ error: "Invalid teacher for this campus." }, { status: 404 });
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        message,
        authorId: teacherProfile.id, // Link to the verified Teacher Profile ID
        targetAll,
        targetSemester,
        targetSection,
      },
    });
    
    return NextResponse.json({ success: true, announcement: newAnnouncement }, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ error: "Failed to create announcement." }, { status: 500 });
  }
}