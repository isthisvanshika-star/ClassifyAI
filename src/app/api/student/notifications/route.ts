import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * GET: Fetches notifications and unread count for a specific student.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId"); // This is the User ID

        if (!studentId) {
            return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
        }

        // Fetch notifications and unread count in parallel for efficiency
        const [notifications, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: { userId: studentId },
                orderBy: { createdAt: 'desc' },
                take: 15, // Get the 15 most recent notifications
            }),
            prisma.notification.count({
                where: { userId: studentId, read: false }
            })
        ]);

        return NextResponse.json({ success: true, notifications, unreadCount });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}

/**
 * PATCH: Marks a list of notifications as read for a specific student.
 */
const markAsReadSchema = z.object({
    studentId: z.string().cuid(),
    notificationIds: z.array(z.string().cuid()),
});

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = markAsReadSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        const { studentId, notificationIds } = validation.data;

        // Update many records at once for efficiency
        await prisma.notification.updateMany({
            where: {
                id: { in: notificationIds },
                userId: studentId, // Security check: ensure user can only update their own notifications
            },
            data: { read: true },
        });
        
        return NextResponse.json({ success: true, message: "Notifications marked as read." });
    } catch (error) {
        console.error("Error updating notifications:", error);
        return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
    }
}