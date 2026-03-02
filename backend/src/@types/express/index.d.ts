import "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      companyId: number;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}
