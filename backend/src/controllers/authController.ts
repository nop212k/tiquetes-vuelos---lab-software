// backend/src/controllers/authController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginUser = async (req: Request, res: Response) => {
  const { login, password } = req.body;
  if (!login || !password) return res.status(400).json({ message: "Debe enviar login y contraseña" });

  try {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository
      .createQueryBuilder("user")
      .where("user.correo = :login OR user.usuario = :login", { login })
      .getOne();

    if (!user) {
      console.warn(`[auth] login no encontrado: ${login}`);
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    if (!user.contrasena) {
      console.warn(`[auth] usuario sin contraseña: id=${user.id}`);
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    const ok = await bcrypt.compare(password, user.contrasena);
    if (!ok) {
      console.warn(`[auth] contraseña incorrecta para login=${login}`);
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    const tipoUsuario = (user.tipo || "cliente").toString();

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("[auth] JWT_SECRET no definido");
      return res.status(500).json({ message: "Server misconfigured: JWT secret missing" });
    }

    const token = jwt.sign({ role: tipoUsuario }, secret, {
      subject: String(user.id),
      expiresIn: "2h",
    });

    const { contrasena: _p, ...userSafe } = (user as any);
    console.log(`[auth] login successful: id=${user.id}, tipo=${tipoUsuario}`);
    return res.json({ token, user: userSafe, tipoUsuario });
  } catch (err) {
    console.error("Error en loginUser:", err);
    return res.status(500).json({ message: err instanceof Error ? err.message : "Error del servidor" });
  }
};
