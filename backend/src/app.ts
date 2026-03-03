import express from "express";
import cors from "cors";
import path from "path";

import { authRoutes } from "./routes/auth.routes";
import { recordRoutes } from "./routes/records.routes";
import { syncRoutes } from "./routes/sync.routes";

import { authMiddleware } from "./middlewares/auth.middleware";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/records", authMiddleware, recordRoutes);
app.use("/sync", authMiddleware, syncRoutes);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
