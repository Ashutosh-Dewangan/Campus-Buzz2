import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import { registerSocketServer } from "./socket";
import { startPostExpiryJob } from "./jobs/post-expiry.job";
import { startExpiryReminderJob } from "./jobs/expiry-reminder.job";
import { PORT, CORS_ORIGINS } from "./config";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGINS,
  },
});

registerSocketServer(io);

const stopPostExpiryJob = startPostExpiryJob();
const stopExpiryReminderJob = startExpiryReminderJob();

httpServer.listen(PORT, () => {
  console.log(
    `Campus Buzz API running on http://localhost:${PORT}`,
  );
});

const shutdown = (signal: string) => {
  console.log(`Received ${signal}. Shutting down...`);

  stopPostExpiryJob();
  stopExpiryReminderJob();

  io.close(() => {
    httpServer.close(() => {
      console.log("Campus Buzz API shut down cleanly.");
      process.exit(0);
    });
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));