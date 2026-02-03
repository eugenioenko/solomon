import express from "express";
import cors from "cors";
import path from "path";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.js";
import levelRoutes from "./routes/levels.js";
import userRoutes from "./routes/users.js";

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/levels", levelRoutes);
app.use("/api/users", userRoutes);

// Serve static client build
const clientPath = path.join(__dirname, "..", "public");
app.use(express.static(clientPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
