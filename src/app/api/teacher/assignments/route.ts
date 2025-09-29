import { prisma } from "@/lib/prisma";
import { sub } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { title } from "process";
import z from "zod";

/**
 * GET: Fetches a list of all assignments created by a specific teacher for their campus.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");
    const campusId = searchParams.get("campusId");
    if (!teacherId || !campusId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }
    const teacherProfile = await prisma.teacher.findFirst({
      where: {
        userId: teacherId,
        user: { campusId: campusId },
      },
      select: { id: true },
    });
    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Teacher not found for campus" },
        { status: 404 }
      );
    }
    const assignments = await prisma.assignment.findMany({
      where: { teacherId: teacherProfile.id },
      include: {
        subject: { select: { name: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, assignments }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST: Creates a new assignment for a specific teacher and subject on their campus.
 */
const createAssignmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  subjectId: z.string().cuid(),
  teacherId: z.string().cuid(),
  campusId: z.string().cuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createAssignmentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { title, description, dueDate, subjectId, teacherId, campusId } =
      validation.data;
    const [teacherProfile, subject] = await Promise.all([
      prisma.teacher.findFirst({
        where: { userId: teacherId, user: { campusId } },
      }),
      prisma.subject.findFirst({ where: { id: subjectId, campusId } }),
    ]);
    if (!teacherProfile || !subject) {
      return NextResponse.json(
        { error: "Invalid teacher or subject for this campus" },
        { status: 404 }
      );
    }
    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        subjectId: subject.id,
        teacherId: teacherProfile.id,
      },
    });
    return NextResponse.json(
      { success: true, assignment: newAssignment },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
