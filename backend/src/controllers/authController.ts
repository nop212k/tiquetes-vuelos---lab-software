import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginUser = async (req: Request, res: Response) => {
  const { login, password } = req.body; // login puede ser correo o usuario

  if (!login || !password) {
    return res.status(400).json({ message: "Debe enviar login y contraseña" });
  }

  try {
    const userRepository = AppDataSource.getRepository(User);

    // Buscar usuario por correo o por nombre de usuario
    const user = await userRepository
      .createQueryBuilder("user")
      .where("user.correo = :login OR user.usuario = :login", { login })
      .getOne();

    if (!user) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    if (!user.contrasena) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.contrasena);
    if (!isMatch) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    // Asegurarse de que tipo exista
    const tipoUsuario = user.tipo || "cliente"; // si es null, asumimos cliente

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, tipoUsuario },
      process.env.JWT_SECRET || "clave_secreta",
      { expiresIn: "1h" }
    );

    // Devolver token y tipo de usuario
    res.json({ token, tipoUsuario });
  } catch (err) {
    console.error("Error en loginUser:", err);
    res.status(500).json({ message: err instanceof Error ? err.message : "Error del servidor" });
  }
};
