import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const today = new Date();

    const events = await prisma.event.findMany({
      where: { date: { gte: today } },
      orderBy: { date: "asc" },
    });

    const insights: string[] = [];
    const risks: string[] = [];

    if (events.length === 0) {
      risks.push("No upcoming events scheduled — idle period detected.");
    }

    // Detect clusters & gaps
    for (let i = 0; i < events.length - 1; i++) {
      const curr = events[i];
      const next = events[i + 1];
      const diffDays =
        (new Date(next.date).getTime() - new Date(curr.date).getTime()) /
        (1000 * 60 * 60 * 24);

      if (diffDays <= 1) {
        risks.push(
          `High load: ${curr.title} and ${next.title} scheduled within 1 day.`
        );
      }
      if (diffDays >= 7) {
        risks.push(
          `Idle period: No events between ${curr.title} (${curr.date.toString().slice(0, 10)}) and ${next.title} (${next.date.toString().slice(0, 10)})`
        );
      }
    }

    // Suggestions
    const noHoliday = events.every((e) => e.type !== "HOLIDAY");
    if (noHoliday) {
      insights.push("No holidays scheduled — consider adding one.");
    }

    const missingDesc = events.filter((e) => !e.description).length;
    if (missingDesc > 0) {
      insights.push(`${missingDesc} upcoming events missing descriptions.`);
    }

    return NextResponse.json({
      success: true,
      risks,
      insights,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}
