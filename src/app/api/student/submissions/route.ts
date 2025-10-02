import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const studentId = formData.get("studentId") as string | null; // This is the User ID
    const campusId = formData.get("campusId") as string | null;
    const assignmentId = formData.get("assignmentId") as string | null;
    const text = formData.get("text") as string | null;

    if (!studentId || !campusId || !assignmentId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // 1. AUTHORIZATION & VALIDATION
    // Verify the student and assignment exist and belong to the same campus.
    const [studentUser, assignment] = await Promise.all([
      prisma.user.findFirst({
        where: { id: studentId, campusId, role: "STUDENT" },
        include: { studentProfile: { select: { id: true } } },
      }),
      prisma.assignment.findFirst({
        where: { id: assignmentId, subject: { campusId } },
      }),
    ]);
    
    if (!studentUser || !studentUser.studentProfile) {
      return NextResponse.json({ error: "Student not found on this campus." }, { status: 404 });
    }
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found on this campus." }, { status: 404 });
    }
    const studentProfileId = studentUser.studentProfile.id;

    // Check for duplicate submissions
    const existingSubmission = await prisma.submission.findFirst({
        where: { studentId: studentProfileId, assignmentId: assignmentId }
    });
    if (existingSubmission) {
        return NextResponse.json({ error: "You have already submitted this assignment." }, { status: 409 });
    }

    // 2. FILE UPLOAD (if a file is provided)
    let fileUrl: string | null = null;
    if (file) {
        const fileBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(fileBuffer);
        const uploadResult = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder: "student_submissions",
                resource_type: "auto", // Allow any file type like PDF, DOCX, etc.
            }, (error, result) => {
                if (error) reject(error);
                resolve(result);
            }).end(buffer);
        });
        fileUrl = uploadResult.secure_url;
    }

    if (!fileUrl && !text) {
        return NextResponse.json({ error: "Submission must include a file or text." }, { status: 400 });
    }

    // 3. CREATE SUBMISSION RECORD
    const newSubmission = await prisma.submission.create({
        data: {
            assignmentId,
            studentId: studentProfileId,
            submittedAt: new Date(),
            fileUrl,
            text,
        }
    });

    return NextResponse.json({ success: true, submission: newSubmission }, { status: 201 });

  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}