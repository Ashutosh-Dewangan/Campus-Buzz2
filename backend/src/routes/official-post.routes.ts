import { Router } from "express";
import {
  createOfficialPostController,
  getOfficialPostsController,
  deleteOfficialPostController,
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
router.delete(
  "/:id",
  deleteOfficialPostController,
);
export default router;