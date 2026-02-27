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
    if (!assistantUser || !assistantUser.campusId) {
    return NextResponse.json(
      { error: "Assistant is not associated with any campus." }, 
      { status: 400 }
    );
}

const updatedCampus = await prisma.campus.update({
      where: { id: assistantUser.campusId },
      data: {
        hindiName: data.hindiName,
        logoUrl: data.logoUrl,
        latitude: data.latitude,
        longitude: data.longitude,
        wifiBssids: data.wifiBssids,
        name: data.name,
        city: data.city,
      },
    });

    return NextResponse.json(updatedCampus, { status: 200 });
    
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