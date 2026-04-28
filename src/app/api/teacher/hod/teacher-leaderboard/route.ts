import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AggTeacher, TeacherEntry } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const campusId = searchParams.get("campusId");
    if (!campusId) {
      return NextResponse.json(
        { error: "campusId is required" },
        { status: 400 }
      );
    }

    const semesterId = searchParams.get("semesterId") ?? undefined;
    const sectionId = searchParams.get("sectionId") ?? undefined;

    // 1️⃣ Fetch teacher-subject mapping
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        subject: { campusId },
        ...(semesterId ? { semesterId } : {}),
        ...(sectionId ? { sectionId } : {}),
      },
      select: {
        teacher: {
          select: {
            id: true,
            user: {
              select: { id: true, name: true },
            },
          },
        },
        subject: {
          select: { id: true, name: true },
        },
      },
    });

    const resources = await prisma.resource.findMany({
      where: {
        subject: { campusId },
      },
      select: {
        subjectId: true,
      },
    });

    const resourceMap = new Map<string, number>();

    for (const r of resources) {
      if (!r.subjectId) continue;
      resourceMap.set(
        r.subjectId,
        (resourceMap.get(r.subjectId) || 0) + 1
      );
    }

    const teacherMap = new Map<string, TeacherEntry>();

    for (const ts of teacherSubjects) {
      if (!ts.teacher || !ts.subject) continue;

      const teacherId = ts.teacher.id;
      const subjectId = ts.subject.id;
      const subjectName = ts.subject.name;

      if (!teacherMap.has(teacherId)) {
        teacherMap.set(teacherId, {
          teacherId,
          userId: ts.teacher.user.id,
          name: ts.teacher.user.name,
          subjects: new Map(),
        });
      }

      const entry = teacherMap.get(teacherId)!;

      if (!entry.subjects.has(subjectId)) {
        entry.subjects.set(subjectId, {
          subjectName,
          resourceCount: resourceMap.get(subjectId) || 0,
        });
      }
    }

    const leaderboard = [];

    for (const entry of teacherMap.values()) {
      let totalResources = 0;
      let subjectsWithResources = 0;

      for (const stat of entry.subjects.values()) {
        totalResources += stat.resourceCount;
        if (stat.resourceCount > 0) {
          subjectsWithResources++;
        }
      }

      const assignedSubjects = entry.subjects.size;

      const status =
        subjectsWithResources < assignedSubjects
          ? "PENDING"
          : "ACTIVE";

      leaderboard.push({
        teacherId: entry.teacherId,
        userId: entry.userId,
        name: entry.name,
        totalResources,
        assignedSubjects,
        subjectsWithResources,
        status,
      });
    }

    leaderboard.sort((a, b) => b.totalResources - a.totalResources);

    return NextResponse.json({
      leaderboard,
    });
  } catch (error) {
    console.error("[TEACHER_ACCOUNTABILITY_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      campusId,
      semesterId,
      sectionId,
      sentBy,
      customMessage,
    } = body;

    if (!campusId || !sentBy) {
      return NextResponse.json(
        { error: "campusId and sentBy are required" },
        { status: 400 }
      );
    }

    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        subject: { campusId },
        ...(semesterId ? { semesterId } : {}),
        ...(sectionId ? { sectionId } : {}),
      },
      select: {
        teacher: {
          select: {
            id: true,
            user: { select: { id: true, name: true } },
          },
        },
        subject: {
          select: { id: true, name: true },
        },
      },
    });

    const resources = await prisma.resource.findMany({
      where: { subject: { campusId } },
      select: { subjectId: true },
    });

    const resourceMap = new Map<string, number>();
    for (const r of resources) {
      if (!r.subjectId) continue;
      resourceMap.set(
        r.subjectId,
        (resourceMap.get(r.subjectId) || 0) + 1
      );
    }

    const teacherMap = new Map<string, AggTeacher>();

    for (const ts of teacherSubjects) {
      if (!ts.teacher || !ts.subject) continue;

      const teacherId = ts.teacher.id;
      const subjectId = ts.subject.id;

      if (!teacherMap.has(teacherId)) {
        teacherMap.set(teacherId, {
          userId: ts.teacher.user.id,
          name: ts.teacher.user.name,
          totalResources: 0,
          assignedSubjects: 0,
          subjectsWithResources: 0,
        });
      }

      const entry = teacherMap.get(teacherId)!;

      entry.assignedSubjects += 1;

      const count = resourceMap.get(subjectId) || 0;
      entry.totalResources += count;

      if (count > 0) {
        entry.subjectsWithResources += 1;
      }
    }

    const pendingTeachers = [];

    for (const entry of teacherMap.values()) {
      if (entry.subjectsWithResources < entry.assignedSubjects) {
        pendingTeachers.push(entry);
      }
    }

    if (pendingTeachers.length === 0) {
      return NextResponse.json({
        message: "All teachers are active 🎉",
        notificationsSent: 0,
      });
    }

    const sender = await prisma.user.findUnique({
      where: { id: sentBy },
      select: { role: true },
    });

    if (!sender || !["ADMIN", "ASSISTANT"].includes(sender.role)) {
      return NextResponse.json(
        { error: "Unauthorized sender" },
        { status: 403 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: "⚠️ Resource Upload Reminder",
        message:
          customMessage ??
          "Please upload study resources for your assigned subjects.",
        assistantId: sentBy,
        targetAll: false,
        isActive: true,
      },
    });

    await prisma.notification.createMany({
      data: pendingTeachers.map((t) => ({
        userId: t.userId,
        title: "📚 Upload Required",
        body:
          `You have pending subjects without resources. ` +
          `Please upload them as soon as possible.`,
        meta: {
          type: "RESOURCE_REMINDER",
          announcementId: announcement.id,
        },
      })),
    });

    return NextResponse.json({
      announcementId: announcement.id,
      notificationsSent: pendingTeachers.length,
      teachersNotified: pendingTeachers.map((t) => t.userId),
    });
  } catch (error) {
    console.error("[TEACHER_ACCOUNTABILITY_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}