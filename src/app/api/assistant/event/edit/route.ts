import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// 1. ADD 'campusId' to the validation schema
const updateEventSchema = z.object({
  eventId: z.string().cuid("Event ID is required"),
  campusId: z.string().cuid("Campus ID is required"),
  title: z.string().optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  type: z.string().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = updateEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { eventId, campusId, ...dataToUpdate } = validation.data;

    const result = await prisma.event.updateMany({
      where: {
        id: eventId,
        campusId: campusId,
      },
      data: {
        ...dataToUpdate,
        ...(dataToUpdate.date && { date: new Date(dataToUpdate.date) }),
      },
    });

    if (result.count === 0) {
        return NextResponse.json({ error: "Event not found or you don't have permission to edit it." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Event updated successfully" });

  } catch (err) {
    console.error("Error editing event:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}