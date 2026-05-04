import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { DM_RULES } from "@/lib/rbac";
import { Role } from "@/generated/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campusId = searchParams.get("campusId");
    const requesterId = searchParams.get("requesterId");
    const forGroup = searchParams.get("forGroup") === "true";
    const isTeacherOnlyGroup = searchParams.get("teacherOnly") === "true";

    if (!campusId || !requesterId) {
      return NextResponse.json(
        { error: "campusId and requesterId is required" },
        { status: 400 },
      );
    }

    //?& get requester role....
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { role: true },
    });

    if (!requester) {
      return NextResponse.json(
        { error: "Requester not found" },
        { status: 404 },
      );
    }

    const requesterRole = requester.role as Role;

    //&determine which roles are visible to this user....
    let allowedRoles: Role[] = [];

    if (forGroup) {
      //? for group creation - filter by group rules....
      if (requesterRole === "STUDENT") {
        allowedRoles = ["STUDENT"];
      } else if (requesterRole === "TEACHER") {
        allowedRoles = isTeacherOnlyGroup
          ? ["TEACHER"]
          : ["STUDENT", "TEACHER"];
      } else if (requesterRole === "ASSISTANT") {
        allowedRoles = ["STUDENT", "TEACHER", "ASSISTANT"];
      } else {
        allowedRoles = [];
      }
    } else {
      allowedRoles = DM_RULES[requesterRole] ?? [];
    }

    if (allowedRoles.length === 0) {
      return NextResponse.json([]);
    }

    //& for students - only show users in same semester....
    let semesterFilter = {};
    if (requesterRole === "STUDENT") {
      const studentProfile = await prisma.student.findUnique({
        where: { userId: requesterId },
        select: { semesterId: true },
      });

      if (studentProfile?.semesterId) {
        semesterFilter = {
          OR: [
            //? other students in same semester....
            {
              role: "STUDENT",
              studentProfile: {
                semesterId: studentProfile.semesterId,
              },
            },
            //? teachers and assistants — no semester filter....
            {
              role: { in: allowedRoles.filter((r) => r !== "STUDENT") },
            },
          ],
        };
      }
    }

    const users = await prisma.user.findMany({
      where: {
        campusId,
        //? exculde self....
        id: { not: requesterId },
        role: { in: allowedRoles },
        ...semesterFilter,
      },
      select: {
        id: true,
        name: true,
        role: true,
        avatarUrl: true,
        studentProfile: {
          select: { semesterId: true },
        },
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
