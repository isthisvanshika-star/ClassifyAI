import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // ❗ NEXT_PUBLIC hata
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", public_id: fileName },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Upload failed"));
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}