import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

interface IUser {
  _id: string;
  name: string;
  email: string;
  image: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  bio: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

// 👇 custom payload type (IMPORTANT)
interface CustomJwtPayload extends JwtPayload {
  user: IUser;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Please Login - No auth header",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    // ✅ Fix: Check if token exists to satisfy TypeScript's strict array indexing
    if (!token || token === "undefined" || token === "null") {
      res.status(401).json({
        message: "Please Login - Malformed or Missing token",
      });
      return;
    }

    // ✅ safer env check
    const secret = process.env.JWT_SEC;

    if (!secret) {
      throw new Error("JWT_SEC not defined");
    }

    const decodeValue = jwt.verify(
      token,
      secret as string,
    ) as unknown as CustomJwtPayload;

    // ✅ proper validation
    if (!decodeValue || !decodeValue.user) {
      res.status(401).json({
        message: "Invalid token",
      });
      return;
    }

    req.user = decodeValue.user;

    next();
  } catch (error) {
    console.log("JWT verification error: ", error);
    res.status(401).json({
      message: "Please Login - Jwt error",
    });
  }
};
