import { AssignmentStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

/**
 * GET: Fetches a list of all assignments created by a specific teacher for their campus.
 */

/**
 * GET: Handles two cases:
 * 1. Fetching a list of all assignments for a teacher.
 * 2. Fetching the details of a single assignment if 'assignmentId' is provided.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId"); // Teacher User ID
    const campusId = searchParams.get("campusId");
    const assignmentId = searchParams.get("assignmentId"); // The new optional parameter

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
        { error: "Teacher not found for campus" },
        { status: 404 }
      );
    }

    // --- NEW: Handle fetching a single assignment ---
    if (assignmentId) {
      const assignment = await prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          teacherId: teacherProfile.id, // Security check: ensure it belongs to this teacher
        },
        include: {
          subject: true,
          submissions: {
            include: {
              student: { include: { user: { select: { name: true } } } },
            },
            orderBy: { submittedAt: "asc" },
          },
        },
      });

      if (!assignment) {
        return NextResponse.json(
          { error: "Assignment not found or you do not have permission." },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, assignment });
    }
    // --- END of single assignment logic ---

    // --- Original logic: Fetch the list of all assignments ---
    const assignments = await prisma.assignment.findMany({
      where: { teacherId: teacherProfile.id },
      include: {
        subject: { select: { name: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, assignments });
  } catch (error) {
    console.error("Error fetching assignments:", error);
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
  totalMarks: z.number().int().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).default("DRAFT"),
  rubric: z.string().optional(),
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
    const {
      title,
      description,
      dueDate,
      subjectId,
      teacherId,
      campusId,
      totalMarks,
      status,
      rubric,
    } = validation.data;
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
        totalMarks,
        status,
        rubric,
      },
    });

    // --- 🚀 AUTOMATIC NOTIFICATION LOGIC ---
    // If the assignment was published, find all students and create notifications.
    if (newAssignment.status === AssignmentStatus.PUBLISHED) {
      try {
        const teacherSubjectLinks = await prisma.teacherSubject.findMany({
          where: { teacherId: teacherProfile.id, subjectId: subject.id },
          select: { sectionId: true },
        });
        const sectionIds = teacherSubjectLinks.map((link) => link.sectionId);
        if (sectionIds.length > 0) {
          const studentsToNotify = await prisma.student.findMany({
            where: {
              sectionId: { in: sectionIds },
              user: { campusId: campusId },
            },
            select: { userId: true }, // We only need their user ID
          });
          if (studentsToNotify.length > 0) {
            const studentUserIds = studentsToNotify.map((s) => s.userId);
            const notificationData = studentUserIds.map((userId) => ({
              userId: userId,
              title: "New Assignment Posted",
              body: `A new assignment, '${newAssignment.title}', has been posted for your subject '${subject.name}'.`,
              meta: {
                link: `/student/assignments/${newAssignment.id}`,
              },
            }));
            await prisma.notification.createMany({
              data: notificationData,
            });
          }
        }
      } catch (notificationError) {
        console.error(
          "Assignment created, but failed to send notifications:",
          notificationError
        );
      }
    }

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
