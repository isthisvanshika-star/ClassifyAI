import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Parser } from "json2csv";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // 1. Get the campusId and type from the URL query parameters.
    const type = searchParams.get("type") || "all";
    const campusId = searchParams.get("campusId");

    if (!campusId) {
      return NextResponse.json({ error: "Campus ID is required" }, { status: 400 });
    }

    // 2. Build a dynamic 'where' clause to scope the query by campus and type.
    const where: any = {
      user: {
        campusId: campusId,
      },
    };

    if (type === "login") {
      where.action = { contains: "logged in" };
    }

    const logs = await prisma.recentActivity.findMany({
      where, // Apply the scoped filter
      orderBy: { timestamp: "desc" },
    });

    // The CSV generation logic remains the same.
    const parser = new Parser({ fields: ["id", "userName", "action", "timestamp"] });
    const csv = parser.parse(logs);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${type}-logs-${campusId}.csv"`,
      },
    });
  } catch(error) {
      console.error("Failed to export logs:", error);
      return NextResponse.json({ error: "Failed to export logs." }, { status: 500 });
  }
}