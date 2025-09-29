import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const WEEKDAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;

/**
 * POST: Creates a new TimetableEntry in the recurring weekly schedule.
 */
const createTimetableEntrySchema = z.object({
  campusId: z.string().cuid(),
  teacherId: z.string().cuid(), // Teacher Profile ID
  subjectId: z.string().cuid(),
  semesterId: z.string().cuid(),
  sectionId: z.string().cuid(),
  weekday: z.enum(WEEKDAYS),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  room: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createTimetableEntrySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { campusId, teacherId, subjectId, semesterId, sectionId, weekday, startTime, endTime, room } = validation.data;

    // Verify that all provided IDs belong to the specified campus
    const [teacher, subject, semester, section] = await Promise.all([
        prisma.teacher.findFirst({ where: { id: teacherId, user: { campusId } } }),
        prisma.subject.findFirst({ where: { id: subjectId, campusId } }),
        prisma.semester.findFirst({ where: { id: semesterId, campusId } }),
        prisma.section.findFirst({ where: { id: sectionId, campusId } }),
    ]);

    if (!teacher || !subject || !semester || !section) {
        return NextResponse.json({ error: "One or more provided IDs are invalid or do not belong to the specified campus." }, { status: 404 });
    }

    // FIX: This now creates a record in the new 'TimetableEntry' table
    const timetableEntry = await prisma.timetableEntry.create({
      data: {
        teacherId,
        subjectId,
        campusId,
        sectionId,
        semesterId,
        weekday,
        room: room ?? null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      }
    });

    return NextResponse.json({ success: true, timetableEntry }, { status: 201 });

  } catch (err: any) {
    console.error("Error creating timetable entry:", err);
    // Check for unique constraint violation
    if (err.code === 'P2002') {
        return NextResponse.json({ error: "This teacher already has a class scheduled at this exact time and day." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create timetable entry" }, { status: 500 });
  }
}

/**
 * GET: Fetches a teacher's full weekly timetable for a specific campus.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId"); // Teacher User ID
    const campusId = searchParams.get("campusId");

    if (!teacherId || !campusId) {
        return NextResponse.json({ error: "Teacher ID and Campus ID are required" }, { status: 400 });
    }
    
    const teacherProfile = await prisma.teacher.findFirst({
        where: { userId: teacherId, user: { campusId: campusId } },
        select: { id: true }
    });

    if (!teacherProfile) {
        return NextResponse.json({ error: "Teacher not found on this campus." }, { status: 404 });
    }

    // FIX: This now fetches data from the 'TimetableEntry' table
    const entries = await prisma.timetableEntry.findMany({
      where: {
        teacherId: teacherProfile.id,
        campusId: campusId,
      },
      orderBy: { startTime: "asc" },
      include: {
        subject: { select: { name: true, code: true } },
        section: { select: { name: true } },
        semester: { select: { name: true } },
      },
    });
    
    // Format the response to be easy for the frontend to use
    // This now directly represents the weekly schedule
    const formattedEntries = entries.map(entry => ({
      id: entry.id,
      weekday: entry.weekday,
      startTime: entry.startTime,
      endTime: entry.endTime,
      room: entry.room,
      subject: entry.subject,
      section: entry.section.name,
      semester: entry.semester.name,
    }));

    return NextResponse.json({ success: true, sessions: formattedEntries });
  } catch (err: any) {
    console.error("Error fetching timetable:", err);
    return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 });
  }
}