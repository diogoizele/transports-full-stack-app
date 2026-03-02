import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);

    req.user = {
      id: payload.sub,
      companyId: payload.companyId,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
