import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@/generated/prisma";

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

    const today = new Date();
    const past7Days = new Date();
    past7Days.setDate(today.getDate() - 6);

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
          date: {
            gte: past7Days,
            lte: today,
          },
          ...(semesterId ? { semesterId } : {}),
          ...(sectionId ? { sectionId } : {}),
        },
      },
      select: {
        status: true,
        classSession: {
          select: {
            date: true,
            subjectId: true,
            subjectRel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const subjectMap = new Map<
      string,
      {
        subjectName: string;
        daily: Map<
          string,
          { present: number; total: number }
        >;
      }
    >();

    for (const att of attendances) {
      if (
        !att.classSession ||
        !att.classSession.subjectId ||
        !att.classSession.subjectRel
      )
        continue;

      const subjectId = att.classSession.subjectId;
      const subjectName = att.classSession.subjectRel.name;

      const dateKey = new Date(
        att.classSession.date
      ).toISOString().split("T")[0];

      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, {
          subjectName,
          daily: new Map(),
        });
      }

      const subjectEntry = subjectMap.get(subjectId)!;

      if (!subjectEntry.daily.has(dateKey)) {
        subjectEntry.daily.set(dateKey, {
          present: 0,
          total: 0,
        });
      }

      const stat = subjectEntry.daily.get(dateKey)!;
      stat.total += 1;

      if (
        att.status === AttendanceStatus.PRESENT ||
        att.status === AttendanceStatus.LATE
      ) {
        stat.present += 1;
      }
    }

    const subjects = [];

    for (const [subjectId, entry] of subjectMap.entries()) {
      const trend = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(past7Days);
        d.setDate(d.getDate() + i);

        const dateKey = d.toISOString().split("T")[0];

        const stat = entry.daily.get(dateKey);

        const percentage =
          stat && stat.total > 0
            ? Math.round((stat.present / stat.total) * 100)
            : 0;

        trend.push({
          date: dateKey,
          percentage,
        });
      }

      subjects.push({
        subjectId,
        subjectName: entry.subjectName,
        trend,
      });
    }

    return NextResponse.json({
      subjects,
    });
  } catch (error) {
    console.error("[SUBJECT_TREND_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}