// src/app/api/admin/campus/[id]/route.ts

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const campusId = id;

    if (!campusId) {
      return NextResponse.json(
        { error: "Campus ID is required" },
        { status: 400 },
      );
    }

    // 🔥 Fetch Campus
    const campus = await prisma.campus.findUnique({
      where: { id: campusId },
      include: {
        users: {
          select: {
            id: true,
            role: true,
          },
        },
        subjects: {
          select: {
            id: true,
          },
        },
        semesters: {
          select: {
            id: true,
            name: true,
          },
        },
        sections: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!campus) {
      return NextResponse.json({ error: "Campus not found" }, { status: 404 });
    }

    // 🔥 Derived Stats (useful for UI)
    const studentsCount = campus.users.filter(
      (u) => u.role === "STUDENT",
    ).length;

    const teachersCount = campus.users.filter(
      (u) => u.role === "TEACHER",
    ).length;

    const assistantsCount = campus.users.filter(
      (u) => u.role === "ASSISTANT",
    ).length;

    // ✅ Clean response (important)
    return NextResponse.json(
      {
        id: campus.id,
        name: campus.name,
        hindiName: campus.hindiName,
        city: campus.city,
        logoUrl: campus.logoUrl,
        slug: campus.slug,
        latitude: campus.latitude,
        longitude: campus.longitude,

        stats: {
          students: studentsCount,
          teachers: teachersCount,
          assistants: assistantsCount,
          subjects: campus.subjects.length,
          semesters: campus.semesters.length,
          sections: campus.sections.length,
        },

        // optional raw data (useful later)
        semesters: campus.semesters,
        sections: campus.sections,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Campus GET Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
