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
      return NextResponse.json(
        { error: "Teacher ID and Campus ID are required" },
        { status: 400 }
      );
    }

    // Securely find the teacher's profile ID
    const teacherProfile = await prisma.teacher.findFirst({
      where: { userId: teacherId, user: { campusId: campusId } },
      select: { id: true },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Teacher not found on this campus." },
        { status: 404 }
      );
    }

    const announcements = await prisma.announcement.findMany({
      where: { authorId: teacherProfile.id }, // Fetch announcements by this teacher
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements." },
      { status: 500 }
    );
  }
}

/**
 * POST: Creates a new announcement.
 */
const createAnnouncementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  message: z.string().min(1, "Message is required."),
  targetAll: z.boolean().default(false),
  targetSemester: z.number().optional().nullable(), // semester number, e.g., 3
  targetSection: z.string().optional().nullable(), // section name, e.g., "A"
  teacherId: z.string().cuid(), // Teacher User ID
  campusId: z.string().cuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createAnnouncementSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      title,
      message,
      targetAll,
      targetSemester,
      targetSection,
      teacherId,
      campusId,
    } = validation.data;

    // Authorization: Verify the teacher belongs to the campus
    const teacherProfile = await prisma.teacher.findFirst({
      where: { userId: teacherId, user: { campusId } },
    });
    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Invalid teacher for this campus." },
        { status: 404 }
      );
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

    try {
      const studentWhereClause: any = {
        user: { campusId: campusId, role: "STUDENT" },
      };
      if (!targetAll) {
        studentWhereClause.user.semester = targetSemester;
        studentWhereClause.section = { name: targetSection };
      }

      const studentsToNotify = await prisma.student.findMany({
        where: studentWhereClause,
        select: { userId: true },
      });
      if (studentsToNotify.length > 0) {
        const studentUserIds = studentsToNotify
          .map((s) => s.userId)
          .filter((id): id is string => !!id);
        const notificationData = studentUserIds.map((userId) => ({
          userId: userId,
          title: `New Announcement: ${newAnnouncement.title}`,
          body:
            newAnnouncement.message.substring(0, 100) +
            (newAnnouncement.message.length > 100 ? "..." : ""),
        }));

        await prisma.notification.createMany({
          data: notificationData,
        });
      }
    } catch (notificationError) {
      console.error(
        "Announcement created but failed to create notifications:",
        notificationError
      );
    }

    return NextResponse.json(
      { success: true, announcement: newAnnouncement },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement." },
      { status: 500 }
    );
  }
}

// =================================================================
// --- NEW DELETE FUNCTION ---
// =================================================================

/**
 * DELETE: Deletes an announcement.
 * Authorization: Only the original author (teacher) can delete their own announcement.
 */
const deleteAnnouncementSchema = z.object({
  announcementId: z.string().cuid(),
  teacherId: z.string().cuid(), // The Teacher User ID
});

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = deleteAnnouncementSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { announcementId, teacherId } = validation.data;

    // --- Authorization Check ---
    // 1. Find the teacher's profile ID
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: teacherId },
      select: { id: true },
    });
    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Teacher profile not found." },
        { status: 404 }
      );
    }

    // 2. Find the announcement
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { authorId: true },
    });

    // 3. Verify that the teacher making the request is the author of the announcement
    if (!announcement || announcement.authorId !== teacherProfile.id) {
      return NextResponse.json(
        { error: "You are not authorized to delete this announcement." },
        { status: 403 }
      );
    }
    // --- End Authorization ---

    // 4. If authorized, delete the announcement
    await prisma.announcement.delete({
      where: { id: announcementId },
    });

    return NextResponse.json({
      success: true,
      message: "Announcement deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement." },
      { status: 500 }
    );
  }
}

// =================================================================
// --- NEW PATCH FUNCTION (for Editing) ---
// =================================================================

/**
 * PATCH: Updates an existing announcement.
 * Authorization: Only the original author (teacher) can edit their own announcement.
 */
const updateAnnouncementSchema = z.object({
  announcementId: z.string().cuid(),
  teacherId: z.string().cuid(), // The Teacher User ID
  // All other fields are optional for a partial update
  title: z.string().min(3).optional(),
  message: z.string().min(1).optional(),
  targetAll: z.boolean().optional(),
  targetSemester: z.number().optional().nullable(),
  targetSection: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = updateAnnouncementSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { announcementId, teacherId, ...dataToUpdate } = validation.data;

    // --- Authorization Check (same as DELETE) ---
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: teacherId },
      select: { id: true },
    });
    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Teacher profile not found." },
        { status: 404 }
      );
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { authorId: true },
    });

    if (!announcement || announcement.authorId !== teacherProfile.id) {
      return NextResponse.json(
        { error: "You are not authorized to edit this announcement." },
        { status: 403 }
      );
    }
    // --- End Authorization ---

    // If authorized, update the announcement with the provided data
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: announcementId },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      announcement: updatedAnnouncement,
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement." },
      { status: 500 }
    );
  }
}
