import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { auth } from "@/auth";
import sharp from "sharp";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File too large. Maximum 5MB." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create upload directory
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const uploadDir = join(process.cwd(), "public", "uploads", year, month);
      await mkdir(uploadDir, { recursive: true });

      // Generate unique filename and optimize with sharp
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
      const filePath = join(uploadDir, uniqueName);

      await sharp(buffer)
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(filePath);

      const url = `/uploads/${year}/${month}/${uniqueName}`;
      uploadedUrls.push(url);
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
