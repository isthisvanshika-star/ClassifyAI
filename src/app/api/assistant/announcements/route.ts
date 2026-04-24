//? (A. Vanshika) route for announcement page of assitant user....
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";


const createAnnouncementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  message: z.string().min(1, "Message is required."),
  targetAll: z.coerce.boolean().default(false),
  targetSemester: z.coerce.number().optional().nullable(), 
  targetSection: z.string().optional().nullable(),
  teacherId: z.string(),
  campusId: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get("campusId");
    const assistantId = searchParams.get("assistantId");
    if (!campusId || !assistantId) {
      return NextResponse.json(
        { success: false, error: "Missing authentication parameters" },
        { status: 400 },
      );
    }
    const assistant = await prisma.user.findFirst({
      where: { id: assistantId, role: "ASSISTANT" },
      select: { id: true },
    });
    if (!assistant) {
      return NextResponse.json(
        { success: false, error: "Assistant not found on this campus." },
        { status: 404 },
      );
    }
    const announcements = await prisma.announcement.findMany({
      where: { author: { user: { campusId } } },
      include: {
        author: {
          include: { user: { select: { name: true, avatarUrl: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    //?(A. Vanshika) Flatten author name into each announcement for easier frontend use....
    const data = announcements.map((a) => ({
      id: a.id,
      title: a.title,
      message: a.message,
      targetAll: a.targetAll,
      targetSemester: a.targetSemester,
      targetSection: a.targetSection,
      createdAt: a.createdAt,
      expiresAt: a.expiresAt,
      isActive: a.isActive,
      authorName: a.author.user.name,
      authorAvatar: a.author.user.avatarUrl,
    }));
    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch announcements" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const announcementId = searchParams.get("announcementId");
    if (!announcementId) {
      return NextResponse.json(
        { success: false, error: "Id did not provided" },
        { status: 400 },
      );
    }
    await prisma.announcement.delete({
      where: { id: announcementId },
    });
    return NextResponse.json({ status: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting  announcements:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete announcements",
      },
      { status: 500 },
    );
  }
}

export async function POST (request: NextRequest){
  try {
    const {searchParams} = new URL(request.url);
    const assistantId = searchParams.get("assistantId");
    if(!assistantId) return NextResponse.json({success: false, error: "Id did not provieded"}, {status: 400});
    const res = await prisma.announcement.create({
      data:{
        
      }
    })
  } catch (error) {
    console.error("Error creating  announcements:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create announcements",
      },
      { status: 500 },
    );
  }
}