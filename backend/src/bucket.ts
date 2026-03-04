import fs from "fs";
import path from "path";
import crypto from "crypto";

export const BUCKET_DIR = path.join(__dirname, "../.bucket");
const IMAGES_DIR = path.join(BUCKET_DIR, "images");

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

export function saveBase64Image(base64: string): string {
  const data = base64.replace(/^data:image\/\w+;base64,/, "");
  const ext = base64.match(/^data:image\/(\w+);base64,/)?.[1] ?? "jpg";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const relativePath = `images/${filename}`;
  const absolutePath = path.join(BUCKET_DIR, relativePath);

  fs.writeFileSync(absolutePath, Buffer.from(data, "base64"));

  return relativePath;
}

export function isBase64(value: string): boolean {
  return (
    value.startsWith("data:image") ||
    /^[A-Za-z0-9+/=]{100,}$/.test(value.slice(0, 100))
  );
}
