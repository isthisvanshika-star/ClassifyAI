// /api/admin/signup/route.ts
import { logActivity } from "@/lib/helper";
import { sendWelcomeEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const signupSchema = z.object({
  mode: z.enum(["add", "remove"]),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["STUDENT", "TEACHER", "ASSISTANT"]),
  premiumFeatures: z.array(z.string()).optional(),
  branch: z.string().optional(),
  year: z.string().optional(),
  semester: z.string().optional(),
  section: z.string().optional(),
  assignedSubjects: z
    .array(
      z.object({
        name: z.string().min(1),
        code: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),
  adminID: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = signupSchema.parse(body);

    // --- AUTHORIZATION (based on provided adminId) ---
    const adminUser = await prisma.user.findUnique({
      where: { id: data.adminID },
      select: { campusId: true, role: true },
    });
    if (
      !adminUser ||
      (adminUser.role !== "ADMIN" && adminUser.role !== "ASSISTANT") ||
      (adminUser.role === "ASSISTANT" && !adminUser.campusId)
    ) {
      return NextResponse.json(
        { error: "Invalid or unconfigured admin account." },
        { status: 403 }
      );
    }
    const campusId = adminUser.campusId;
    // --- END OF AUTHORIZATION ---

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email, campusId: campusId },
    });

    // ==================== ADD USER ====================
    if (data.mode === "add") {
      if (adminUser.role === "ASSISTANT" && data.role === "ASSISTANT") {
        return NextResponse.json(
          {
            error:
              "You do not have permission to create another Assistant account.",
          },
          { status: 403 }
        );
      }
      if (!campusId) {
        return NextResponse.json(
          { error: "Admin is not associated with a campus." },
          { status: 400 }
        );
      }

      const existingUser = await prisma.user.findFirst({
        where: { email: data.email, campusId: campusId },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists on this campus" },
          { status: 409 }
        );
      }

      const newUser = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          username: data.email.split("@")[0],
          role: data.role,
          campusId: campusId,
          premiumFeatures: data.premiumFeatures
            ? { connect: data.premiumFeatures.map((name) => ({ name })) }
            : undefined,
          branch:
            data.role === "STUDENT" ? data.branch ?? undefined : undefined,
          year:
            data.role === "STUDENT" && data.year
              ? Number(data.year)
              : undefined,
          // 2. (IMPROVEMENT) Made parsing the semester number safer
          semester:
            data.role === "STUDENT" && data.semester
              ? Number(data.semester.match(/\d+/)?.[0] || 0)
              : undefined,
        },
      });

      // --- KEEPS YOUR EXISTING TEACHER LOGIC ---
      if (newUser.role === "TEACHER") {
        const teacherProfile = await prisma.teacher.create({
          data: { userId: newUser.id },
        });
        // ======== ASSIGN SUBJECT =========== //
        if (
          data.assignedSubjects &&
          data.assignedSubjects.length > 0 &&
          data.semester &&
          data.section
        ) {
          const semesterRecord = await prisma.semester.findFirst({
            where: { name: data.semester, campusId },
          });
          const sectionRecord = await prisma.section.findFirst({
            where: { name: data.section, campusId },
          });
          if (semesterRecord && sectionRecord) {
            const subjectIds = await Promise.all(
              data.assignedSubjects.map(async (subject) => {
                const existingSubject = await prisma.subject.findFirst({
                  where: { name: subject.name, campusId: campusId },
                });
                if (existingSubject) {
                  return existingSubject.id;
                }
                // 2. UPDATE 'create' CALL to include 'description'
                const newSubject = await prisma.subject.create({
                  data: {
                    name: subject.name,
                    code: subject.code,
                    description: subject.description, 
                    campusId: campusId,
                  },
                });
                return newSubject.id;
              })
            );

            const assignmentsData = subjectIds.map((subjectId) => ({
              teacherId: teacherProfile.id,
              subjectId: subjectId,
              semesterId: semesterRecord.id,
              sectionId: sectionRecord.id,
            }));

            await prisma.teacherSubject.createMany({
              data: assignmentsData,
              skipDuplicates: true,
            });
          }
        }
      }

      // --- 3. ADDED THIS ENTIRE BLOCK TO HANDLE STUDENT PROFILE CREATION ---
      if (newUser.role === "STUDENT") {
        let semesterRecord = null;

        if (data.semester) {
          // FIX: Scope semester search and creation to the admin's campus.
          semesterRecord = await prisma.semester.findFirst({
            where: { name: data.semester, campusId: campusId },
          });
          if (!semesterRecord) {
            semesterRecord = await prisma.semester.create({
              data: {
                name: data.semester,
                number: Number(data.semester.match(/\d+/)?.[0] || 0),
                campusId: campusId,
              },
            });
          }
        }

        let sectionRecord = null;
        if (data.section) {
          sectionRecord = await prisma.section.findFirst({
            where: { name: data.section, campusId: campusId },
          });
          if (!sectionRecord) {
            sectionRecord = await prisma.section.create({
              data: { name: data.section, campusId: campusId },
            });
          }
        }

        // Creates the Student profile and links it to the User, Semester, and Section
        await prisma.student.create({
          data: {
            userId: newUser.id,
            semesterId: semesterRecord?.id, // Use optional chaining in case semester wasn't provided
            sectionId: sectionRecord?.id, // Use optional chaining in case section wasn't provided
          },
        });
      }

      if (newUser.role === "ASSISTANT") {
        try {
          await sendWelcomeEmail(newUser.email, newUser.name);
        } catch (emailError) {
          console.error(
            "Signup succeeded, but failed to send welcome email:",
            emailError
          );
        }
      }

      await logActivity(
        newUser.id,
        newUser.name,
        `${newUser.name} added by CLASSIFYAI-admin`
      );

      return NextResponse.json(newUser, { status: 201 });
    }

    // ==================== REMOVE USER (with improvements) ====================
    if (data.mode === "remove") {
      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await logActivity(
        existingUser.id,
        existingUser.name,
        `${existingUser.name} removed by CLASSIFYAI-admin`
      );

      // --- KEEPS YOUR EXISTING REMOVAL LOGIC ---
      await prisma.recentActivity.deleteMany({
        where: { userId: existingUser.id },
      });
      await prisma.attendance.deleteMany({
        where: { userId: existingUser.id },
      }); // Note: Changed to userId
      await prisma.googleToken.deleteMany({
        where: { userId: existingUser.id },
      });

      // --- KEEPS YOUR TEACHER DELETION LOGIC ---
      if (existingUser.role === "TEACHER") {
        await prisma.teacher.deleteMany({ where: { userId: existingUser.id } });
      }

      // --- 4. (IMPROVEMENT) ADDED LOGIC TO DELETE STUDENT PROFILE ON REMOVAL ---
      if (existingUser.role === "STUDENT") {
        await prisma.student.deleteMany({ where: { userId: existingUser.id } });
      }

      // Finally, delete the user
      await prisma.user.delete({
        where: { email: data.email },
      });

      return NextResponse.json({ message: "User removed" }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (err) {
    console.error("Error during signup:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
