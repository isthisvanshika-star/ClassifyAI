import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import z from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
const pdfParse = require("pdf-parse");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

//? (A. Vanshika) Adding Gemini AI API integration for 5 points summary....
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const campusId = searchParams.get("campusId");

    if (!teacherId || !campusId) {
      return NextResponse.json(
        { error: "Teacher ID and Campus ID are required" },
        { status: 400 },
      );
    }

    const teacherProfile = await prisma.teacher.findFirst({
      where: { userId: teacherId, user: { campusId: campusId } },
      select: { id: true },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Teacher not found on this campus." },
        { status: 404 },
      );
    }

    const resources = await prisma.resource.findMany({
      where: { uploadedBy: teacherProfile.id },
      include: { subject: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, resources });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources." },
      { status: 500 },
    );
  }
}

//? (A. Vanshika) POST Route {Upgraded with AI summary}....

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const subjectId = formData.get("subjectId") as string | null;
    const teacherId = formData.get("teacherId") as string | null;
    const campusId = formData.get("campusId") as string | null;

    const resourceType = (formData.get("resourceType") as any) || "NOTES";

    if (!file || !title || !subjectId || !teacherId || !campusId) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    const [teacherProfile, subject] = await Promise.all([
      prisma.teacher.findFirst({
        where: { userId: teacherId, user: { campusId } },
      }),
      prisma.subject.findFirst({ where: { id: subjectId, campusId } }),
    ]);
    if (!teacherProfile || !subject) {
      return NextResponse.json(
        { error: "Invalid teacher or subject for this campus." },
        { status: 404 },
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    const originalFileName = file.name || "";
    const fileExtension =
      originalFileName.split(".").pop()?.toLowerCase() || "unknown";

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "course_resources",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            resolve(result);
          },
        )
        .end(buffer);
    });

    let aiSummary: string[] = [];
    if (
      fileExtension === "pdf" &&
      (resourceType === "NOTES" || resourceType === "PYQ")
    ) {
      if (buffer.length > 10 * 1024 * 1024) {
        console.log("Large PDF detected, skipping AI summary");
      } else {
        try {
          console.log("Extracting text from PDF Buffer...");
          const pdfData = await pdfParse(buffer);
          const extractedText = pdfData.text
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 15000);

          if (extractedText.trim().length > 0) {
            console.log("Asking Gemini for a 5-point summary...");
            const model = genAI.getGenerativeModel({
              model: "gemini-1.5-flash",
            });

            const prompt = `You are an expert college professor. Read the following text extracted from a document. Provide a concise, 5-point bulleted summary of the most important concepts. Keep each point under 2 sentences. DO NOT use markdown like ** or *, just return the 5 plain text points separated by the '|' character. 
          Text: ${extractedText}`;

            const result = await model.generateContent(prompt);
            const aiResponse = result.response.text();

            aiSummary = aiResponse
              .split("|")
              .map((point) => point.trim())
              .filter((point) => point.length > 0)
              .slice(0, 5);

            console.log("AI Summary Generated!", aiSummary);
          }
        } catch (aiError) {
          console.error(
            "AI Parsing failed, saving resource without summary.",
            aiError,
          );
        }
      }
    }
    const newResource = await prisma.resource.create({
      data: {
        title,
        description,
        url: uploadResult.secure_url,
        uploadedBy: teacherProfile.id,
        subjectId: subject.id,
        resourceType,
        fileExtension,
        aiSummary,
      },
    });

    return NextResponse.json(
      { success: true, resource: newResource },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error uploading resource:", error);
    return NextResponse.json(
      { error: "Failed to upload resource." },
      { status: 500 },
    );
  }
}

const deleteResourceSchema = z.object({
  resourceId: z.string().cuid(),
  teacherId: z.string().cuid(),
});

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = deleteResourceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { resourceId, teacherId } = validation.data;
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: teacherId },
      select: { id: true },
    });
    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Teacher profile not found." },
        { status: 404 },
      );
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource || resource.uploadedBy !== teacherProfile.id) {
      return NextResponse.json(
        { error: "You are not authorized to delete this resource." },
        { status: 403 },
      );
    }
    try {
      const publicId = resource.url.split("/").pop()?.split(".")[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`course_resources/${publicId}`);
      }
    } catch (cloudinaryError) {
      console.error(
        "Cloudinary deletion failed, but proceeding with DB deletion:",
        cloudinaryError,
      );
    }

    await prisma.resource.delete({
      where: { id: resourceId },
    });

    return NextResponse.json({
      success: true,
      message: "Resource deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: "Failed to delete resource." },
      { status: 500 },
    );
  }
}
