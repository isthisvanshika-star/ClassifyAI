import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// --- ZOD SCHEMA FOR CREATING A CAMPUS ---
const campusCreateSchema = z.object({
  assistantId: z.string(), 
  name: z.string().min(3),
  city: z.string().min(2),
  hindiName: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  wifiBssids: z.array(z.string()).optional().default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = campusCreateSchema.parse(body);

    const assistantUser = await prisma.user.findUnique({ where: { id: data.assistantId } });
    if (!assistantUser || assistantUser.role !== 'ASSISTANT') {
        return NextResponse.json({ error: "Invalid assistant ID" }, { status: 403 });
    }
    if (assistantUser.campusId) {
        return NextResponse.json({ error: "This assistant is already configured." }, { status: 409 });
    }

    const newCampus = await prisma.$transaction(async (tx) => {
      const campus = await tx.campus.create({
        data: {
          name: data.name,
          slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          hindiName: data.hindiName,
          city: data.city,
          logoUrl: data.logoUrl,
          latitude: data.latitude,
          longitude: data.longitude,
          wifiBssids: data.wifiBssids,
        },
      });
      
      await tx.user.update({
        where: { id: data.assistantId },
        data: { campusId: campus.id },
      });
      return campus;
    });

    return NextResponse.json(newCampus, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Failed to create campus:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    try {
        
        const campuses = await prisma.campus.findMany({
            orderBy: { name: "asc" },
        });

        return NextResponse.json(campuses);

    } catch (error) {
        console.error("Failed to fetch campuses:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}