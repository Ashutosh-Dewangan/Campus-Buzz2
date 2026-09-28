import { Router } from "express";

import {
  createOfficialPostController,
  getOfficialPostsController,
} from "../controllers/official-post.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  getOfficialPostsController,
);

router.post(
  "/",
  createOfficialPostController,
);

export default router;