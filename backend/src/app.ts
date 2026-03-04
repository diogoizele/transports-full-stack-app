import express from "express";
import cors from "cors";
import path from "path";

import { authRoutes } from "./routes/auth.routes";
import { recordRoutes } from "./routes/records.routes";
import { syncRoutes } from "./routes/sync.routes";

import { authMiddleware } from "./middlewares/auth.middleware";
import uploadRoutes from "./routes/uploads.routes";

export const app = express();

app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/auth", authRoutes);
app.use("/records", authMiddleware, recordRoutes);
app.use("/sync", authMiddleware, syncRoutes);
app.use("/uploads", uploadRoutes);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
