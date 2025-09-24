// backend/src/controllers/authController.ts
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginUser = async (req: Request, res: Response) => {
  const { login, password } = req.body;
  if (!login || !password) return res.status(400).json({ message: "Debe enviar login y contraseña" });

  try {
    const userRepository = AppDataSource.getRepository(User);

    // Buscar primero por correo
    let user = await userRepository.findOneBy({ correo: login });

    // Si no se encontró, buscar por usuario
    if (!user) {
      user = await userRepository.findOneBy({ usuario: login });
    }



    if (!user) return res.status(401).json({ message: "Usuario o contraseña incorrectos" });

    const validPassword = await bcrypt.compare(password, user.contrasena);
    if (!validPassword) return res.status(401).json({ message: "Usuario o contraseña incorrectos" });

    const tipoUsuario = (user.tipo || "cliente").toLowerCase();
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: "Server misconfigured: JWT secret missing" });

    const token = jwt.sign({ role: tipoUsuario }, secret, {
      subject: String(user.id),
      expiresIn: "2h",
    });

    const { contrasena, ...userSafe } = user as any;
    return res.json({ token, user: userSafe, tipoUsuario });

  } catch (err) {
    console.error("loginUser error:", err);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { login } = req.body;
  if (!login) return res.status(400).json({ message: "Enviar usuario o correo" });

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: [
        { correo: login },
        { usuario: login }
      ]
    });

    if (!user) return res.status(200).json({ message: "Si existe la cuenta, se ha enviado un email (no revelamos existencia)" });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: "Server misconfigured" });

    const token = jwt.sign({ action: "reset" }, secret, { subject: String(user.id), expiresIn: "1h" });
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;

    return res.json({ message: "Si existe la cuenta, se ha enviado un email", resetUrl, token });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: "Enviar token y nueva contraseña" });

  try {
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

    // Validar política de contraseña
    if (newPassword.length < 8) return res.status(400).json({ message: "Contraseña muy corta" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.contrasena = hashed;
    await userRepo.save(user);

    return res.json({ message: "Contraseña actualizada" });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Obtener info del usuario logueado
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    const { contrasena: _p, ...userSafe } = user as any;
    return res.json({ user: userSafe });
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
