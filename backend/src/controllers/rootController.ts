import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";

// Listar clientes y admins
export const getRootUsers = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const clientes = await userRepository.find({ where: { tipo: "cliente" } });
    const admins = await userRepository.find({ where: { tipo: "admin" } });

    res.json({ clientes, admins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

// Promover cliente → admin
export const promoteToAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOneBy({ id: Number(id) });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    user.tipo = "admin";
    await userRepository.save(user);

    res.json({ message: "Usuario promovido a admin" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al promover usuario" });
  }
};

// Degradar admin → cliente
export const demoteToClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOneBy({ id: Number(id) });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    user.tipo = "cliente";
    await userRepository.save(user);

    res.json({ message: "Usuario degradado a cliente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al degradar usuario" });
  }
};

// Eliminar usuario
export const deleteRootUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOneBy({ id: Number(id) });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    await userRepository.remove(user);

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};
