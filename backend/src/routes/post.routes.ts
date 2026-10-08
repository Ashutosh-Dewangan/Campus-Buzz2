import { Router } from "express";
import multer from "multer";

import {
  createPost,
  getPosts,
  getPostContactInfo,
} from "../controllers/post.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";

const router = Router();

function hasValidImageSignature(
  file: Express.Multer.File,
): boolean {
  const buffer = file.buffer;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a,
      ]),
    );

  // JPEG: FF D8 FF
  const isJpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  return isPng || isJpeg;
}
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_req, file, callback) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg"
    ) {
      callback(null, true);
      return;
    }

    callback(
      new Error(
        "Only PNG and JPEG images are allowed",
      ),
    );
  },
});
router.get(
  "/",
  authenticate,
  getPosts,
);
router.get(
  "/:id/contact",
  authenticate,
  getPostContactInfo,
);
router.post(
  "/",
  authenticate,
  requireRole("STUDENT"),
  upload.single("image"),
  (req, res, next) => {
    if (!req.file) {
      res.status(400).json({
        message: "Image is required",
      });
      return;
    }

    if (!hasValidImageSignature(req.file)) {
      res.status(400).json({
        message: "Invalid image file",
      });
      return;
    }

    next();
  },
  createPost,
);

export default router;