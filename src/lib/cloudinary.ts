import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export async function uploadFile(file: File): Promise<string> {
  if (!file || file.size === 0) throw new Error("Archivo inválido");

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "chambanica/cedulas",
        transformation: [{ width: 800, crop: "limit" }],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary error:", error);
          reject(error);
        } else {
          resolve(result?.secure_url || "");
        }
      }
    );
    uploadStream.end(buffer);
  });
}