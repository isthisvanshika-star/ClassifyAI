import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId"); // User ID
    const campusId = searchParams.get("campusId");

    if (!teacherId || !campusId) {
      return NextResponse.json({ error: "Teacher ID and Campus ID are required" }, { status: 400 });
    }

    const teacherProfile = await prisma.teacher.findFirst({
      where: { userId: teacherId, user: { campusId: campusId } },
      select: { id: true },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: "Teacher not found on this campus." }, { status: 404 });
    }

    const resources = await prisma.resource.findMany({
      where: { uploadedBy: teacherProfile.id },
      include: { subject: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, resources });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json({ error: "Failed to fetch resources." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const title = formData.get("title") as string | null;
        const description = formData.get("description") as string | null;
        const subjectId = formData.get("subjectId") as string | null;
        const teacherId = formData.get("teacherId") as string | null;
        const campusId = formData.get("campusId") as string | null;

        if (!file || !title || !subjectId || !teacherId || !campusId) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        const [teacherProfile, subject] = await Promise.all([
            prisma.teacher.findFirst({ where: { userId: teacherId, user: { campusId } } }),
            prisma.subject.findFirst({ where: { id: subjectId, campusId } }),
        ]);
        if (!teacherProfile || !subject) {
            return NextResponse.json({ error: "Invalid teacher or subject for this campus." }, { status: 404 });
        }

        const fileBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(fileBuffer);
        const uploadResult = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder: "course_resources",
                resource_type: "auto",
            }, (error, result) => {
                if (error) reject(error);
                resolve(result);
            }).end(buffer);
        });

        const newResource = await prisma.resource.create({
            data: {
                title,
                description,
                url: uploadResult.secure_url,
                uploadedBy: teacherProfile.id,
                subjectId: subject.id,
            }
        });

        return NextResponse.json({ success: true, resource: newResource }, { status: 201 });

    } catch (error) {
        console.error("Error uploading resource:", error);
        return NextResponse.json({ error: "Failed to upload resource." }, { status: 500 });
    }
}