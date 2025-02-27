import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import config from "../config";

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["next-auth.session-token"];

    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized - No token provided" });
    }

    const secret = config.next.nextUrl;
    if (!secret) {
      throw new Error("Auth secret not configured");
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};
