import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Get the campusId from the URL to enforce multi-tenancy
    const campusId = searchParams.get("campusId");
    if (!campusId) {
      return NextResponse.json({ success: false, message: "Campus ID is required" }, { status: 400 });
    }

    // --- Pagination Logic (remains the same) ---
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    // --- Sorting Logic (remains the same) ---
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const allowedSortBy = ["title", "date", "type", "active"];
    const orderByField = allowedSortBy.includes(sortBy) ? sortBy : "date";
    const orderBy = { [orderByField]: sortOrder };

    // 2. Create a reusable 'where' clause to scope all queries to the specific campus
    const whereClause = {
        campusId: campusId,
    };

    // --- Fetch Data and Total Count Concurrently ---
    // 3. Apply the where clause to BOTH database queries
    const [events, totalEvents] = await prisma.$transaction([
      prisma.event.findMany({
        where: whereClause, // Scoped to the campus
        orderBy,
        select: {
          id: true,
          title: true,
          date: true,
          type: true,
          description: true,
          active: true,
        },
        skip,
        take: limit,
      }),
      prisma.event.count({
        where: whereClause, // Scoped to the campus
      }),
    ]);

    // --- Return Paginated Response ---
    return NextResponse.json({
      success: true,
      events,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalEvents / limit),
        totalEvents,
        limit,
      },
    });
  } catch (error) {
    console.error("Failed to fetch events for admin:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch events" },
      { status: 500 }
    );
  }
}