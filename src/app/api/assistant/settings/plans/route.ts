import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * GET: Fetches all plan configurations.
 * Accessible by both Super Admins and Campus Admins.
 */
export async function GET(request: NextRequest) {
  try {
    // Authorization check
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("assistantId");
    if (!adminId) {
      return NextResponse.json(
        { success: false, error: "Admin ID is required." },
        { status: 400 }
      );
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    });
    if (
      !adminUser ||
      (adminUser.role !== "ADMIN" && adminUser.role !== "ASSISTANT")
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required." },
        { status: 403 }
      );
    }

    const plans = await prisma.planConfig.findMany({
      orderBy: { price: "asc" },
    });

    return NextResponse.json({ success: true, plans });
  } catch (err) {
    console.error("Error fetching plans:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

/**
 * POST: Updates a specific plan's price.
 * Accessible by both Super Admins and Campus Admins.
 */
const updatePlanSchema = z.object({
  adminId: z.string().cuid("A valid admin ID is required"),
  name: z.string().min(1, "Plan name is required"),
  price: z.number().int().min(0, "Price must be a positive number"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = updatePlanSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { adminId, name, price } = validation.data;

    // UPDATED: Now allows both ADMIN and ASSISTANT to change prices
    const adminUser = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    });
    if (
      !adminUser ||
      (adminUser.role !== "ADMIN" && adminUser.role !== "ASSISTANT")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Admin or Assistant access required.",
        },
        { status: 403 }
      );
    }

    const updatedPlan = await prisma.planConfig.update({
      where: { name },
      data: { price },
    });

    return NextResponse.json({ success: true, updated: updatedPlan });
  } catch (err) {
    console.error("Error updating plan:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update plan" },
      { status: 500 }
    );
  }
}
