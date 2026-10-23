import { createHash } from "node:crypto";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { assertAdminApiSession } from "@/lib/admin-session";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "belle-food";

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }
  return { cloudName, apiKey, apiSecret, folder };
}

function signCloudinaryPayload(params: Record<string, string>, apiSecret: string) {
  const sorted = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${sorted}${apiSecret}`).digest("hex");
}

export async function POST(request: Request) {
  const isAdmin = await assertAdminApiSession();
  if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const cloudinary = getCloudinaryConfig();
  if (!cloudinary) {
    return NextResponse.json(
      { message: "Cloud storage is not configured. Set CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET variables." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ message: "Only image uploads are allowed" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ message: "File too large. Max 8MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const compressed = await sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 82, progressive: true })
    .toBuffer();

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const publicId = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase()}`;

  const signature = signCloudinaryPayload(
    {
      folder: cloudinary.folder,
      public_id: publicId,
      timestamp,
    },
    cloudinary.apiSecret,
  );

  const cloudinaryForm = new FormData();
  cloudinaryForm.append("file", new Blob([compressed], { type: "image/jpeg" }), `${publicId}.jpg`);
  cloudinaryForm.append("api_key", cloudinary.apiKey);
  cloudinaryForm.append("timestamp", timestamp);
  cloudinaryForm.append("folder", cloudinary.folder);
  cloudinaryForm.append("public_id", publicId);
  cloudinaryForm.append("signature", signature);

  const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`, {
    method: "POST",
    body: cloudinaryForm,
    cache: "no-store",
  });

  if (!uploadResponse.ok) {
    return NextResponse.json({ message: "Cloud upload failed" }, { status: 502 });
  }

  const uploaded = (await uploadResponse.json()) as { secure_url?: string };
  if (!uploaded.secure_url) {
    return NextResponse.json({ message: "Cloud upload response missing secure URL" }, { status: 502 });
  }

  return NextResponse.json({ url: uploaded.secure_url });
}
