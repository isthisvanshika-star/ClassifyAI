import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * GET: Fetches the email for a specific assistant user.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assistantId = searchParams.get("assistantId");

    if (!assistantId) {
      return NextResponse.json({ error: "Assistant ID is required." }, { status: 400 });
    }

    const assistant = await prisma.user.findUnique({
      where: { id: assistantId },
      select: { email: true, role: true },
    });

    // FIX: This now specifically checks for the ASSISTANT role.
    if (!assistant || assistant.role !== "ASSISTANT") {
      return NextResponse.json({ error: "Assistant user not found." }, { status: 404 });
    }

    return NextResponse.json({ email: assistant.email });
  } catch (err) {
    console.error("Error fetching assistant email:", err);
    return NextResponse.json({ error: "Failed to fetch assistant email." }, { status: 500 });
  }
}


/**
 * POST: Updates the email for a specific assistant user.
 */
const updateEmailSchema = z.object({
    assistantId: z.string().cuid("A valid assistant ID is required"),
    newEmail: z.string().email("A valid new email is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = updateEmailSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { assistantId, newEmail } = validation.data;

    // FIX: Verify the user being updated is actually an Assistant.
    const assistant = await prisma.user.findUnique({
        where: { id: assistantId },
        select: { role: true },
    });

    if (!assistant || assistant.role !== "ASSISTANT") {
        return NextResponse.json({ error: "User is not an assistant." }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: assistantId },
      data: { email: newEmail },
    });

    return NextResponse.json({
      success: true,
      email: updatedUser.email,
    });
  } catch (err) {
    console.error("Error updating assistant email:", err);
    return NextResponse.json({ error: "Failed to update assistant email." }, { status: 500 });
  }
}