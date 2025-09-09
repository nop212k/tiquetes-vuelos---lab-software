import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginUser = async (req: Request, res: Response) => {
  const { login, password } = req.body; // login puede ser correo o usuario

  try {
    const userRepository = AppDataSource.getRepository(User);

    // Buscamos usuario por correo o por usuario
    const user = await userRepository
      .createQueryBuilder("user")
      .where("user.correo = :login OR user.usuario = :login", { login })
      .getOne();

    if (!user) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    // Comparamos contraseña
    const isMatch = await bcrypt.compare(password, user.contrasena);
    if (!isMatch) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    // Generamos token JWT
    const token = jwt.sign(
      { id: user.id, tipoUsuario: user.tipo },
      process.env.JWT_SECRET || "clave_secreta",
      { expiresIn: "1h" }
    );

    // Enviamos token y tipo de usuario
    res.json({ token, tipoUsuario: user.tipo });
  } catch (err) {
    console.error("Error en loginUser:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};
