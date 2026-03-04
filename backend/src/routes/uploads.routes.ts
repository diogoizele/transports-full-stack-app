import { Router, Request, Response } from "express";
import path from "path";

import { BUCKET_DIR } from "../bucket";

const uploadRoutes = Router();

uploadRoutes.get("/*", (req: Request, res: Response) => {
  const relativePath = req.params[0];
  const absolutePath = path.join(BUCKET_DIR, relativePath);

  return res.sendFile(absolutePath, (err) => {
    if (err) res.status(404).json({ error: "File not found" });
  });
});

export default uploadRoutes;
