import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const createAnnouncementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  message: z.string().min(1, "Message is required."),
  targetAll: z.boolean().default(false),
  targetSemester: z.number().optional().nullable(),
  targetSection: z.string().optional().nullable(),
  teacherId: z.string().cuid(), 
  campusId: z.string().cuid(),
});

const updateAnnouncementSchema = z.object({
  announcementId: z.string().cuid(),
  teacherId: z.string().cuid(), 
  title: z.string().min(3).optional(),
  message: z.string().min(1).optional(),
  targetAll: z.boolean().optional(),
  targetSemester: z.number().optional().nullable(),
  targetSection: z.string().optional().nullable(),
});


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId"); 
    const campusId = searchParams.get("campusId");

    if (!teacherId || !campusId) {
      return NextResponse.json(
        { error: "Teacher ID and Campus ID are required" },
        { status: 400 }
      );
    }
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
      where: { authorId: teacherProfile.id },
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

//*ZOD SCHEMA UPAR LE LIYA HAI (CONFUSE MAT HONA)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("attachment") as File | null;

    const rawData = {
      title: formData.get("title"),
      message: formData.get("message"),
      targetAll: formData.get("targetAll"),
      targetSemester: formData.get("targetSemester"),
      targetSection: formData.get("targetSection"),
      teacherId: formData.get("teacherId"),
      campusId: formData.get("campusId"),
    };
    const validation = createAnnouncementSchema.safeParse(rawData);

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
    const teacherProfile = await prisma.teacher.findFirst({
      where: { userId: teacherId, user: { campusId } },
    });
    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Invalid teacher for this campus." },
        { status: 404 }
      );
    }

    let attachmentData;
    if (file) {
      const fileBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(fileBuffer);
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "announcements_attachments",
              resource_type: "auto",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      attachmentData = {
        create: {
          title: file.name,
          url: uploadResult.secure_url,
          uploadedBy: teacherProfile.id,
        }
      }
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        message,
        authorId: teacherProfile.id,
        targetAll,
        targetSemester,
        targetSection,
        attachments: attachmentData
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
const deleteAnnouncementSchema = z.object({
  announcementId: z.string().cuid(),
  teacherId: z.string().cuid(),
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
        { error: "You are not authorized to delete this announcement." },
        { status: 403 }
      );
    }
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

//* SCHEMA UPAR LE LIYA GAYA HAI SIR JI
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
