import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@/generated/prisma";
import { AggEntry, StudentEntry, SubjectStat } from "@/lib/types";

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

    const threshold = Number(searchParams.get("threshold") ?? 75);
    const semesterId = searchParams.get("semesterId") ?? undefined;
    const sectionId = searchParams.get("sectionId") ?? undefined;

    const attendances = await prisma.attendance.findMany({
      where: {
        status: {
          in: [
            AttendanceStatus.PRESENT,
            AttendanceStatus.LATE,
            AttendanceStatus.ABSENT,
          ],
        },
        classSession: {
          campusId,
          ...(semesterId ? { semesterId } : {}),
          ...(sectionId ? { sectionId } : {}),
        },
        student: {
          ...(semesterId ? { semesterId } : {}),
          ...(sectionId ? { sectionId } : {}),
        },
      },
      select: {
        status: true,
        student: {
          select: {
            id: true,
            rollNumber: true,
            user: {
              select: { id: true, name: true },
            },
          },
        },
        classSession: {
          select: {
            subjectId: true,
            subjectRel: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
    });



    const studentMap = new Map<string, StudentEntry>();

    for (const att of attendances) {
      if (
        !att.student ||
        !att.classSession ||
        !att.classSession.subjectId ||
        !att.classSession.subjectRel
      ) {
        continue;
      }
      const subjectId   = att.classSession.subjectId;
      const subjectName = att.classSession.subjectRel.name;
      const subjectCode = att.classSession.subjectRel.code;

      if (!studentMap.has(att.student.id)) {
        studentMap.set(att.student.id, {
          studentId:  att.student.id,
          userId:     att.student.user.id,
          name:       att.student.user.name,
          rollNumber: att.student.rollNumber,
          subjects:   new Map(),
        });
      }

      const studentEntry = studentMap.get(att.student.id)!;

      if (!studentEntry.subjects.has(subjectId)) {
        studentEntry.subjects.set(subjectId, {
          subjectId,
          subjectName,
          subjectCode,
          present: 0,
          total:   0,
        });
      }

      const subjectStat = studentEntry.subjects.get(subjectId)!;
      subjectStat.total += 1;

      if (
        att.status === AttendanceStatus.PRESENT ||
        att.status === AttendanceStatus.LATE
      ) {
        subjectStat.present += 1;
      }
    }

    const defaulters: {
      studentId: string;
      userId: string;
      name: string;
      rollNumber: string | null;
      subjects: (Omit<SubjectStat, never> & { percentage: number })[];
      lowestPercentage: number;
    }[] = [];

    for (const entry of studentMap.values()) {
      const subjectsBelow: (SubjectStat & { percentage: number })[] = [];

      for (const stat of entry.subjects.values()) {
        const percentage =
          stat.total > 0
            ? Math.round((stat.present / stat.total) * 100)
            : 0;

        if (percentage < threshold) {
          subjectsBelow.push({ ...stat, percentage });
        }
      }

      if (subjectsBelow.length > 0) {
        subjectsBelow.sort((a, b) => a.percentage - b.percentage);

        defaulters.push({
          studentId: entry.studentId,
          userId: entry.userId,
          name: entry.name,
          rollNumber: entry.rollNumber,
          subjects: subjectsBelow,
          lowestPercentage: subjectsBelow[0].percentage,
        });
      }
    }

    defaulters.sort((a, b) => a.lowestPercentage - b.lowestPercentage);

    return NextResponse.json({ threshold, defaulters });
  } catch (error) {
    console.error("[DEFAULTER_RADAR_GET]", error);
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
      threshold = 75,
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

    const attendances = await prisma.attendance.findMany({
      where: {
        status: {
          in: [
            AttendanceStatus.PRESENT,
            AttendanceStatus.LATE,
            AttendanceStatus.ABSENT,
          ],
        },
        classSession: {
          campusId,
          ...(semesterId ? { semesterId } : {}),
          ...(sectionId ? { sectionId } : {}),
        },
        student: {
          ...(semesterId ? { semesterId } : {}),
          ...(sectionId ? { sectionId } : {}),
        },
      },
      select: {
        status: true,
        student: {
          select: {
            id: true,
            user: { select: { id: true, name: true } },
          },
        },
        classSession: {
          select: {
            subjectId: true,
            subjectRel: { select: { name: true } },
          },
        },
      },
    });


    const aggMap = new Map<string, AggEntry>();

    for (const att of attendances) {
      if (
        !att.student ||
        !att.classSession ||
        !att.classSession.subjectId ||
        !att.classSession.subjectRel
      ) continue;

      const subjectId   = att.classSession.subjectId;
      const subjectName = att.classSession.subjectRel.name;

      if (!aggMap.has(att.student.id)) {
        aggMap.set(att.student.id, {
          userId:       att.student.user.id,
          name:         att.student.user.name,
          worstSubject: "",
          worstPct:     100,
          subjectStats: new Map(),
        });
      }

      const entry = aggMap.get(att.student.id)!;
      if (!entry.subjectStats.has(subjectId)) {
        entry.subjectStats.set(subjectId, { name: subjectName, present: 0, total: 0 });
      }
      const stat = entry.subjectStats.get(subjectId)!;
      stat.total += 1;
      if (att.status === AttendanceStatus.PRESENT || att.status === AttendanceStatus.LATE) {
        stat.present += 1;
      }
    }

    const defaulterUserIds: string[] = [];
    const defaulterDetails: { userId: string; name: string; worstSubject: string; worstPct: number }[] = [];

    for (const entry of aggMap.values()) {
      let isDefaulter = false;
      let worstPct = 100;
      let worstSubject = "";

      for (const [, stat] of entry.subjectStats) {
        const pct = stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0;
        if (pct < threshold) {
          isDefaulter = true;
          if (pct < worstPct) {
            worstPct = pct;
            worstSubject = stat.name;
          }
        }
      }

      if (isDefaulter) {
        defaulterUserIds.push(entry.userId);
        defaulterDetails.push({
          userId: entry.userId,
          name: entry.name,
          worstSubject,
          worstPct,
        });
      }
    }

    if (defaulterUserIds.length === 0) {
      return NextResponse.json({
        announcementId: null,
        notificationsSent: 0,
        defaultersWarned: [],
        message: "No defaulters found — no notifications sent.",
      });
    }

    const sender = await prisma.user.findUnique({
      where: { id: sentBy },
      select: { role: true, teacherProfile: { select: { id: true } } },
    });

    if (!sender || !["TEACHER", "ADMIN", "ASSISTANT"].includes(sender.role)) {
      return NextResponse.json({ error: "Unauthorized sender" }, { status: 403 });
    }

    const title = "Attendance Warning — Immediate Action Required";
    const defaultMessage =
      `Your attendance has fallen below ${threshold}%. ` +
      `Continued absence may result in academic consequences. ` +
      `Please meet your subject teacher immediately.`;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        message: customMessage ?? defaultMessage,
        assistantId: sender.role === "ADMIN" || sender.role === "ASSISTANT" ? sentBy : null,
        authorId: sender.teacherProfile?.id ?? null,
        targetAll: false,
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.notification.createMany({
      data: defaulterDetails.map((d) => ({
        userId: d.userId,
        title: "Low Attendance Alert",
        body:
          `Your attendance in ${d.worstSubject} is at ${d.worstPct}%, ` +
          `which is below the required ${threshold}%. Take action now.`,
        meta: {
          type: "ATTENDANCE_WARNING",
          announcementId: announcement.id,
          threshold,
          worstSubject: d.worstSubject,
          worstPercentage: d.worstPct,
        },
        read: false,
      })),
    });

    return NextResponse.json({
      announcementId: announcement.id,
      notificationsSent: defaulterUserIds.length,
      defaultersWarned: defaulterUserIds,
    });
  } catch (error) {
    console.error("[DEFAULTER_RADAR_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}