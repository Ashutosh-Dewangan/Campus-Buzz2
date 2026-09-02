import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const uploadDirectory = path.resolve(
  process.cwd(),
  "uploads",
);

export async function saveUploadedImage(
  file: Express.Multer.File,
): Promise<string> {
  await fs.mkdir(uploadDirectory, {
    recursive: true,
  });

  const extension =
    file.mimetype === "image/png"
      ? ".png"
      : ".jpg";

  const filename =
    `${crypto.randomUUID()}${extension}`;

  const filePath = path.join(
    uploadDirectory,
    filename,
  );

  await fs.writeFile(filePath, file.buffer);

  return `/uploads/${filename}`;
}