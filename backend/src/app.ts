import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import postRoutes from "./routes/post.routes";
import path from "node:path";
import chatRoutes from "./routes/chat.routes";
import officialPostRoutes from "./routes/official-post.routes";
import eventRoutes from "./routes/event.routes";
import organizationRoutes from "./routes/organization.routes";
import complaintRoutes from "./routes/complaint.routes";
import notificationRoutes from "./routes/notification.routes";
import { CORS_ORIGINS } from "./config";
import multer from "multer";

const app = express();

app.use(
  cors({
    origin: CORS_ORIGINS,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(
    path.resolve(process.cwd(), "uploads"),
  ),
);
app.use("/api/posts", postRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/official", officialPostRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/complaints", complaintRoutes);
app.use(
  "/api/notifications",
  notificationRoutes,
);

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Campus Buzz API is running" });
});

// Auth & Test Routes
app.use("/api/auth", authRoutes);

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({
          message: "Image must be 5 MB or smaller",
        });
        return;
      }

      res.status(400).json({
        message: "Invalid image upload",
      });
      return;
    }

    if (error instanceof Error) {
      if (
        error.message ===
        "Only PNG and JPEG images are allowed"
      ) {
        res.status(400).json({
          message: error.message,
        });
        return;
      }

      if (error.message === "Invalid image file") {
        res.status(400).json({
          message: error.message,
        });
        return;
      }
    }

    next(error);
  },
);

export default app;
