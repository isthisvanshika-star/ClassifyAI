import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * GET: Fetches support requests for a specific campus.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get("campusId");

    if (!campusId) {
      return NextResponse.json({ success: false, error: "Campus ID is required." }, { status: 400 });
    }

    const requests = await prisma.supportRequest.findMany({
      where: {
        user: {
          campusId: campusId,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, requests });
  } catch (err) {
    console.error("Error fetching support requests:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch requests." }, { status: 500 });
  }
}


/**
 * DELETE: Deletes a support request from a specific campus.
 */
const deleteRequestSchema = z.object({
    requestId: z.string().cuid(),
    campusId: z.string().cuid(),
});

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = deleteRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        const { requestId, campusId } = validation.data;

        // Securely delete the request ONLY IF its ID matches and it belongs to a user of the specified campus.
        const result = await prisma.supportRequest.deleteMany({
            where: {
                id: requestId,
                user: {
                    campusId: campusId,
                }
            }
        });

        if (result.count === 0) {
            return NextResponse.json({ error: "Request not found or you don't have permission." }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Request deleted." });
    } catch (err) {
        console.error("Error deleting support request:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}