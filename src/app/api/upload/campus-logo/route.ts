import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

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
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "campus_logos",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        )
        .end(buffer);
    });
    const secureUrl = (result as { secure_url: string }).secure_url;
    if (!secureUrl) {
      throw new Error("Cloudinary did not return a secure URL.");
    }
    return NextResponse.json(
      { success: true, url: secureUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "File upload failed." }, { status: 500 });
  }
}
