// backend/src/controllers/userController.ts
// AGREGAR estas funciones al archivo existente

import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";
import bcrypt from "bcryptjs";

// ==================== YA EXISTENTES ====================
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    const { contrasena: _p, ...userSafe } = (user as any);
    return res.json({ user: userSafe });
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      tipoDocumento,
      documento,
      nombres,
      apellidos,
      fechaNacimiento,
      lugarNacimiento,
      direccion,
      genero,
      correo,
      usuario,
      contrasena,
    } = req.body;

    const userRepository = AppDataSource.getRepository(User);

    const existingUser = await userRepository.findOne({
      where: [
        { correo },
        { usuario }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: "Correo o usuario ya registrado" });
    }

    const newUser = new User();
    newUser.tipoDocumento = tipoDocumento;
    newUser.documento = documento;
    newUser.nombres = nombres;
    newUser.apellidos = apellidos;
    newUser.fechaNacimiento = fechaNacimiento;
    newUser.lugarNacimiento = lugarNacimiento;
    newUser.direccion = direccion;
    newUser.genero = genero;
    newUser.correo = correo;
    newUser.usuario = usuario;
    newUser.contrasena = await bcrypt.hash(contrasena, 10);
    const requestedTipo = String(req.body.tipo || "cliente").trim().toLowerCase();
    newUser.tipo = requestedTipo === "root"
      ? "root"
      : requestedTipo === "admin"
        ? "admin"
        : "cliente";

    await userRepository.save(newUser);

    res.status(201).json({ message: "Usuario registrado correctamente", id: newUser.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// ==================== NUEVAS FUNCIONES ====================

/**
 * Actualizar perfil del usuario autenticado
 * PUT /api/users/me
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const { nombres, apellidos, correo, direccion, genero } = req.body;
    const userRepository = AppDataSource.getRepository(User);

    // Si están cambiando el correo, verificar que no esté en uso
    if (correo && correo !== user.correo) {
      const existingEmail = await userRepository.findOne({ where: { correo } });
      if (existingEmail) {
        return res.status(400).json({ message: "El correo ya está en uso" });
      }
    }

    // Actualizar solo los campos que se enviaron
    if (nombres !== undefined) user.nombres = nombres;
    if (apellidos !== undefined) user.apellidos = apellidos;
    if (correo !== undefined) user.correo = correo;
    if (direccion !== undefined) user.direccion = direccion;
    if (genero !== undefined) user.genero = genero;

    await userRepository.save(user);

    // Devolver usuario sin contraseña
    const { contrasena: _p, ...userSafe } = user;
    return res.json({ 
      message: "Perfil actualizado correctamente", 
      user: userSafe 
    });

  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

/**
 * Cambiar contraseña del usuario autenticado
 * PUT /api/users/me/password
 */
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const { currentPassword, newPassword } = req.body;

    // Validaciones
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Se requiere la contraseña actual y la nueva" 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: "La nueva contraseña debe tener al menos 8 caracteres" 
      });
    }

    // Verificar que la contraseña actual sea correcta
    const isValidPassword = await bcrypt.compare(currentPassword, user.contrasena);
    if (!isValidPassword) {
      return res.status(400).json({ 
        message: "La contraseña actual es incorrecta" 
      });
    }

    // Verificar que la nueva contraseña sea diferente
    const isSamePassword = await bcrypt.compare(newPassword, user.contrasena);
    if (isSamePassword) {
      return res.status(400).json({ 
        message: "La nueva contraseña debe ser diferente a la actual" 
      });
    }

    // Actualizar contraseña
    const userRepository = AppDataSource.getRepository(User);
    user.contrasena = await bcrypt.hash(newPassword, 10);
    await userRepository.save(user);

    return res.json({ 
      message: "Contraseña actualizada correctamente" 
    });

  } catch (error) {
    console.error("changePassword error:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
};
