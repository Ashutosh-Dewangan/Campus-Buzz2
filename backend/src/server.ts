import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import { registerSocketServer } from "./socket";
import { startPostExpiryJob } from "./jobs/post-expiry.job";
import { startExpiryReminderJob } from "./jobs/expiry-reminder.job";
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
registerSocketServer(io);
startPostExpiryJob();
startExpiryReminderJob();
httpServer.listen(PORT, () => {
  console.log(
    `Campus Buzz API running on http://localhost:${PORT}`,
  );
});