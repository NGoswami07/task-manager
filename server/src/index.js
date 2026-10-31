import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import taskRoutes from "./routes/tasks.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/tasks", taskRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

const port = process.env.PORT || 5000;
try {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/taskflow",
  );
  console.log("Connected to MongoDB");
  app.listen(port, () =>
    console.log(`API listening on http://localhost:${port}`),
  );
} catch (error) {
  console.error("Could not connect to MongoDB:", error.message);
  process.exit(1);
}
