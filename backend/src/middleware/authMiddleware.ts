// backend/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";

const userRepo = () => AppDataSource.getRepository(User);

export interface AuthRequest extends Request {
  user?: User | null;
  tokenPayload?: any;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET no está definido en el entorno");
      return res.status(500).json({ message: "Server misconfigured: JWT secret missing" });
    }

    let payload: any;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      console.error("JWT verify error:", err);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const userId = payload?.sub ?? payload?.id;
    if (!userId) {
      console.warn("Token sin subject/id:", payload);
      return res.status(401).json({ message: "Invalid token (missing subject)" });
    }

    const user = await userRepo().findOneBy({ id: Number(userId) });
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    req.tokenPayload = payload;
    return next();
  } catch (err) {
    console.error("authMiddleware error:", err);
    return res.status(500).json({ message: "Auth error" });
  }
}

export function isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const user = req.user;
  const payload = req.tokenPayload ?? {};
  if (!user) return res.status(401).json({ message: "Not authenticated" });

  // normalizamos: trim + lowercase
  const tipo = (user as any).tipo ? String((user as any).tipo).trim().toLowerCase() : "";
  if (tipo === "admin") return next();

  // fallback: revisar role en token
  if (typeof payload.role === "string" && payload.role.trim().toLowerCase() === "admin") return next();

  return res.status(403).json({ message: "Requires admin role" });
}

export function isRoot(req: AuthRequest, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Not authenticated" });
  const tipo = (user as any).tipo ? String((user as any).tipo).trim().toLowerCase() : "";
  if (tipo === "root") return next();
  return res.status(403).json({ message: "Requires root role" });
}
