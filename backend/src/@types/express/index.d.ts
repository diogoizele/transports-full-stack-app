import "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      companyId: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}
