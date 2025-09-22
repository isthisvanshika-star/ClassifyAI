import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * GET: Returns total and login log counts for a specific campus.
 */
export async function GET(request: NextRequest) {
  try {
    // Get the campusId from the URL to scope the query.
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get("campusId");

    if (!campusId) {
      return NextResponse.json({ error: "Campus ID is required." }, { status: 400 });
    }
    
    // Create a reusable 'where' clause to filter by campus.
    const whereClause = {
        user: { campusId: campusId }
    };

    const [totalCount, loginCount] = await Promise.all([
      prisma.recentActivity.count({ where: whereClause }),
      prisma.recentActivity.count({
        where: {
            ...whereClause, // Apply the campus filter
            action: {
                contains: "logged in",
            },
        },
      }),
    ]);

    return NextResponse.json({ totalCount, loginCount });
  } catch (err) {
    console.error("Error fetching logs count:", err);
    return NextResponse.json({ error: "Failed to fetch logs count." }, { status: 500 });
  }
}

/**
 * DELETE: Deletes a specified number of logs (all or login) for a specific campus.
 */
const deleteLogsSchema = z.object({
    count: z.number().int().positive("Count must be a positive number."),
    type: z.enum(["all", "login"]),
    campusId: z.string().cuid("A valid campus ID is required."),
});

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = deleteLogsSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { count, type, campusId } = validation.data;
    
    const where: any = {
      user: {
        campusId: campusId,
      },
    };

    if (type === "login") {
      where.action = { contains: "logged in" };
    }

    const availableLogsCount = await prisma.recentActivity.count({ where });

    if (count > availableLogsCount) {
        return NextResponse.json(
            { error: `You requested to delete ${count} logs, but only ${availableLogsCount} are available.` },
            { status: 400 }
        );
    }

    const logsToDelete = await prisma.recentActivity.findMany({
      where,
      orderBy: { timestamp: "asc" }, // Find the OLDEST logs
      take: count,
      select: { id: true },
    });
    
    if (logsToDelete.length === 0) {
        return NextResponse.json({ success: true, deleted: 0, message: "No logs to delete." });
    }

    const deleted = await prisma.recentActivity.deleteMany({
      where: { id: { in: logsToDelete.map((log) => log.id) } },
    });

    return NextResponse.json({ success: true, deleted: deleted.count });
  } catch (err) {
    console.error("Error deleting logs:", err);
    return NextResponse.json({ error: "Failed to delete logs." }, { status: 500 });
  }
}