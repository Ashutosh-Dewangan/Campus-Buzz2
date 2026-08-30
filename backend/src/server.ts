import express from "express";

const app = express();
app.use(express.json());
const PORT = 5000;

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Campus Buzz API is running"
  });
});

app.listen(PORT, () => {
  console.log(`Campus Buzz API running on http://localhost:${PORT}`);
});