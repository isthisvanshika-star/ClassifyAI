import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const setupSchema = z.object({
  // Campus Details
  campusName: z.string().min(1),
  campusHindiName: z.string().optional(),
  city: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  
  // Admin Details
  adminName: z.string().min(1),
  adminEmail: z.string().email(),
  
  // Security
  setupKey: z.string().optional(), 
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = setupSchema.parse(body);

    // Security Check
    if (process.env.SETUP_SECRET && data.setupKey !== process.env.SETUP_SECRET) {
      return NextResponse.json({ error: "Unauthorized setup attempt." }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.adminEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists." }, { status: 409 });
    }

    // Generate a simple slug from the campus name
    const slug = data.campusName.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    const result = await prisma.$transaction(async (tx) => {
      // Create the Campus with all required fields
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

      // Create the Admin User
      const newAdmin = await tx.user.create({
        data: {
          name: data.adminName,
          email: data.adminEmail,
          username: data.adminEmail.split("@")[0],
          role: "ADMIN",
          campusId: newCampus.id,
        },
      });

      return { newAdmin, newCampus };
    });

    return NextResponse.json({
      message: "System setup successful",
      admin: result.newAdmin,
      campus: result.newCampus
    }, { status: 201 });

  } catch (err) {
    console.error("Setup Error:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}