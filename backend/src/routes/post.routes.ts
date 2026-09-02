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
  createPost,
);

export default router;