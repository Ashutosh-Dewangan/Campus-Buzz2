import { Router } from "express";

import {
  createEventController,
  deleteEventController,
  getEventsController,
  updateEventController,
} from "../controllers/event.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getEventsController);

router.post("/", createEventController);

router.patch(
  "/:id",
  updateEventController,
);

router.delete(
  "/:id",
  deleteEventController,
);

export default router;