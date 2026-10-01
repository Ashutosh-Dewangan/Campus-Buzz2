import { Router } from "express";
import {
  createComplaintController,
  getComplaintsController,
  resolveComplaintController,
} from "../controllers/complaint.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getComplaintsController);
router.post("/", createComplaintController);
router.patch("/:id/resolve", resolveComplaintController);

export default router;