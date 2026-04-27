import { transformUsername } from "@/lib/helper";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const setupSchema = z.object({
  campusName: z.string().min(1),
  campusHindiName: z.string().optional(),
  city: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  adminName: z.string().min(1),
  adminEmail: z.string().email(),
  setupKey: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = setupSchema.parse(body);
    if (process.env.SETUP_KEY && data.setupKey !== process.env.SETUP_KEY) {
      return NextResponse.json(
        { error: "Unauthorized setup attempt." },
        { status: 401 },
      );
    }
    const existingUser = await prisma.user.findUnique({
      where: { email: data.adminEmail },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists." },
        { status: 409 },
      );
    }
    const secureUsername = await transformUsername(data.adminEmail);
    const slug = data.campusName
      .toLowerCase()
      .trim()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    const result = await prisma.$transaction(async (tx) => {
      const newCampus = await tx.campus.create({
        data: {
          name: data.campusName,
          hindiName: data.campusHindiName || "",
          slug: slug,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
        },
      });
      const newAdmin = await tx.user.create({
        data: {
          name: data.adminName,
          email: data.adminEmail,
          username: secureUsername,
          role: "ADMIN",
          campusId: newCampus.id,
        },
      });
      return { newAdmin, newCampus };
    });
    return NextResponse.json(
      {
        message: "System setup successful",
        admin: result.newAdmin,
        campus: result.newCampus,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Setup Error:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
