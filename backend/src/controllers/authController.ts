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


/**
 * POST /api/auth/forgot-password
 * body: { login }  // correo o usuario
 * En producción: envia email con link que contiene token de reset.
 * En dev: devolvemos token en la respuesta (para testing).
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { login } = req.body;
    if (!login) return res.status(400).json({ message: "Enviar usuario o correo" });

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo
      .createQueryBuilder("u")
      .where("u.correo = :login OR u.usuario = :login", { login })
      .getOne();

    if (!user) return res.status(200).json({ message: "Si existe la cuenta, se ha enviado un email (no revelamos existencia)" });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: "Server misconfigured" });

    // token de reset con expiry corto
    const token = jwt.sign({ action: "reset" }, secret, { subject: String(user.id), expiresIn: "1h" });

    // En producción: generar url e enviar por email
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;

    // TODO: enviar email con resetUrl (SMTP / SendGrid / Mailgun)
    // Por ahora en dev devolvemos el resetUrl (y token) en la respuesta para testing.
    return res.json({ message: "Si existe la cuenta, se ha enviado un email", resetUrl, token });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

/**
 * POST /api/auth/reset-password
 * body: { token, newPassword }
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: "Enviar token y nueva contraseña" });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: "Server misconfigured" });

    let payload: any;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    const userId = payload?.sub ?? payload?.id;
    if (!userId) return res.status(400).json({ message: "Token inválido" });

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: Number(userId) });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Validar políticas de contraseña (coherente con frontend)
    if (newPassword.length < 10) return res.status(400).json({ message: "Contraseña muy corta" });
    if (!/[A-Z]/.test(newPassword)) return res.status(400).json({ message: "Debe contener mayúscula" });
    if (!/[0-9]/.test(newPassword)) return res.status(400).json({ message: "Debe contener número" });
    if (/[^a-zA-Z0-9]/.test(newPassword)) return res.status(400).json({ message: "No se permiten símbolos" });

    // Hashear y guardar
    const hashed = await bcrypt.hash(newPassword, 10);
    user.contrasena = hashed;
    await userRepo.save(user);

    return res.json({ message: "Contraseña actualizada" });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};