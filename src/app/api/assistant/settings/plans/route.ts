import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * GET: Fetches all plan configurations.
 * This is now a PUBLIC endpoint, accessible by anyone (students, admins, etc.).
 */
export async function GET() {
  try {
    // REMOVED: All authorization checks have been removed from the GET request.
    // Now any user can fetch the list of plans for the pricing page.
    const plans = await prisma.planConfig.findMany({
      orderBy: { price: "asc" }, // Order plans by price (e.g., Free, Pro, Ultimate)
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
 * This remains a PROTECTED endpoint, accessible only by admins.
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

    // Authorization check remains here to protect this action.
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