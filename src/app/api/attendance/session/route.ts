import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// This array now serves as the source of truth for weekday validation
const WEEKDAYS = [
  "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY",
] as const;

/**
 * POST: Create a ClassSession for a specific campus.
 */
const createSessionSchema = z.object({
  campusId: z.string().cuid(),
  teacherId: z.string().cuid(), // Teacher Profile ID
  subjectId: z.string().cuid(),
  semesterId: z.string().cuid(),
  sectionId: z.string().cuid(),
  // FIX: Use z.enum with the string array instead of z.nativeEnum
  weekday: z.enum(WEEKDAYS),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  room: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createSessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { campusId, teacherId, subjectId, semesterId, sectionId, weekday, startTime, endTime, room } = validation.data;

    const [teacher, subject, semester, section] = await Promise.all([
        prisma.teacher.findFirst({ where: { id: teacherId, user: { campusId } } }),
        prisma.subject.findFirst({ where: { id: subjectId, campusId } }),
        prisma.semester.findFirst({ where: { id: semesterId, campusId } }),
        prisma.section.findFirst({ where: { id: sectionId, campusId } }),
    ]);

    if (!teacher || !subject || !semester || !section) {
        return NextResponse.json({ error: "One or more provided IDs are invalid or do not belong to the specified campus." }, { status: 404 });
    }

    const session = await prisma.classSession.create({
      data: {
        date: new Date(),
        teacherId,
        subjectId,
        campusId,
        sectionId,
        semesterId,
        weekday,
        room: room ?? null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        semester: semester.number ?? 0,
        section: section.name
      }
    });

    return NextResponse.json({ success: true, session }, { status: 201 });

  } catch (err: any) {
    console.error("Error creating timetable session:", err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

/**
 * GET: Fetch a teacher's full weekly timetable for a specific campus.
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

    const sessions = await prisma.classSession.findMany({
      where: {
        teacherId: teacherProfile.id,
        campusId: campusId,
      },
      orderBy: { startTime: "asc" },
      include: {
        subjectRel: { select: { name: true, code: true } },
        sectionRel: { select: { name: true } },
        semesterRel: { select: { name: true } },
      },
    });
    
    // This mapping simplifies the structure for the frontend
    const formattedSessions = sessions.map(s => ({
      id: s.id,
      weekday: s.weekday,
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room,
      subject: s.subjectRel ? {name: s.subjectRel.name, code: s.subjectRel.code}: null,
      section: s.sectionRel?.name || null ,
      semester: s.semesterRel?.name || null,
    }));

    return NextResponse.json({ success: true, sessions: formattedSessions });
  } catch (err: any) {
    console.error("Error fetching timetable:", err);
    return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 });
  }
}