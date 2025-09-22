import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logActivity } from "@/lib/helper";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId } = body;

    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json(
        { error: "Valid Event ID is required" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const eventToDelete = await tx.event.findUniqueOrThrow({
        where: { id: eventId },
      });

      await tx.event.delete({
        where: { id: eventId },
      });

      await logActivity(
        eventToDelete.createdBy,
        "CLASSIFYAI_ADMIN",
        `Event deleted: ${eventToDelete.title}`
      );
    });

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (err: unknown) {
    console.error("Error deleting event:", err);
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
  }

  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
