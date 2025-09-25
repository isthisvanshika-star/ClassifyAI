// /api/upload/student-avatar/route.ts
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
    const studentId = formData.get("studentId") as string | null;

    if (!file || !studentId) {
      return NextResponse.json(
        { error: "File and Student ID are required." },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Upload to Cloudinary with Rekognition tagging
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "student_avatars",
            categorization: "aws_rek_tagging", // Amazon Rekognition Auto Tagging
          },
          (error, result) => {
            if (error) reject(error);
            resolve(result);
          }
        )
        .end(buffer);
    });

    // Extract Rekognition tags from response
    const rekognitionTags =
      uploadResult?.info?.categorization?.aws_rek_tagging?.data || [];

    const hasPerson = rekognitionTags.some(
      (tag: any) =>
        tag.tag.toLowerCase() === "person" || tag.tag.toLowerCase() === "human"
    );

    if (!hasPerson) {
      // Delete useless upload
      await cloudinary.uploader.destroy(uploadResult.public_id);
      return NextResponse.json(
        {
          error:
            "No face detected. Please upload a clear picture of yourself.",
        },
        { status: 400 }
      );
    }

    // Save avatar URL to student record
    const secureUrl = uploadResult.secure_url;
    await prisma.user.update({
      where: { id: studentId },
      data: { avatarUrl: secureUrl },
    });

    return NextResponse.json({ success: true, url: secureUrl });
  } catch (error) {
    console.error("Avatar Upload API Error:", error);
    return NextResponse.json({ error: "File upload failed." }, { status: 500 });
  }
}
