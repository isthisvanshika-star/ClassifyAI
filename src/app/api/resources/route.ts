import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createResourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  fileExtension: z.string().optional(),
  resourceType: z.enum(["NOTES", "PYQ", "SYLLABUS", "VIDEO_LINK"]).default("NOTES"),
  uploadedBy: z.string().optional(),
  chatMessageId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createResourceSchema.parse(body);

    const resource = await prisma.resource.create({
      data: {
        title: data.title,
        url: data.url,
        fileExtension: data.fileExtension,
        resourceType: data.resourceType,
        uploadedBy: data.uploadedBy,
        chatMessageId: data.chatMessageId,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (err) {
    console.error("Resource create error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}