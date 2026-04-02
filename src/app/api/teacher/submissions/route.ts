import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { stampDigitalApproval } from "@/lib/helper";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";



const gradeSubmissionSchema = z.object({
    submissionId: z.string().cuid(),
    teacherId: z.string().cuid(),
    grade: z.number().min(0),
    feedback: z.string().optional(),
    attachSignature: z.boolean().optional(),
    audioFeedbackUrl : z.string().nullable().optional()
});

export async function GET(req: NextRequest) {
  try { 
    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");
    const teacherId = searchParams.get("teacherId");

    if (!assignmentId || !teacherId) {
      return NextResponse.json({ error: "Assignment ID and Teacher ID are required" }, { status: 400 });
    }
    const [assignment, teacherProfile] = await Promise.all([
        prisma.assignment.findUnique({ where: { id: assignmentId } }),
        prisma.teacher.findUnique({ where: { userId: teacherId } })
    ]);
    
    if (!assignment || !teacherProfile || assignment.teacherId !== teacherProfile.id) {
        return NextResponse.json({ error: "Unauthorized or assignment not found." }, { status: 403 });
    }
    const submissions = await prisma.submission.findMany({
      where: { assignmentId: assignmentId },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });

    return NextResponse.json({ success: true, submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: "Failed to fetch submissions." }, { status: 500 });
  }
}

//*  YAHA KA VALIDATION UPAR SHIFTED HAI  BETTER COMPILATION KE LIYE*//
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = gradeSubmissionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        const { submissionId, teacherId, grade, feedback, attachSignature, audioFeedbackUrl } = validation.data;



        const [submission, teacherProfile] = await Promise.all([
            prisma.submission.findUnique({ 
                where: { id: submissionId }, 
                include: { assignment: true } 
            }),
            prisma.teacher.findUnique({ 
                where: { userId: teacherId },
                include: { user: { select: { name: true } } }
            })
        ]);

        if (!submission || !teacherProfile || submission.assignment.teacherId !== teacherProfile.id) {
            return NextResponse.json({ error: "Unauthorized or submission not found." }, { status: 403 });
        }

        let updatedFileURL = submission.fileUrl;

        if(attachSignature && submission.fileUrl && submission.fileUrl.endsWith(".pdf")) {
            try {
                const stampedBuffer = await  stampDigitalApproval(submission.fileUrl, teacherProfile.user.name,submission.id);
                const fileName = `graded_${submission.id}_${Date.now()}.pdf`;
                updatedFileURL = await uploadBufferToCloudinary(stampedBuffer, fileName);
            } catch (stampError) {
                console.error("Error during stamping or uploading:", stampError);
                throw new Error("Failed to attach digital signature to the PDF.");
            }
        }

        const updatedSubmission = await prisma.submission.update({
            where: { id: submissionId },
            data: {
                grade,
                feedback,
                audioFeedbackUrl,
                fileUrl: updatedFileURL,
                gradedBy: teacherProfile.user.name,
                gradedAt: new Date(),
            }
        });

        return NextResponse.json({ success: true, submission: updatedSubmission });

    } catch (error) {
        console.error("Error grading submission:", error);
        return NextResponse.json({ error: "Failed to grade submission." }, { status: 500 });
    }
}