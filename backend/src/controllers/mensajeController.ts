import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Mensaje } from "../models/Mensaje";
import { Chat } from "../models/Chat";
import { User } from "../models/User";

const mensajeRepo = AppDataSource.getRepository(Mensaje);
const chatRepo = AppDataSource.getRepository(Chat);
const userRepo = AppDataSource.getRepository(User);

/* ==========================================================
   Obtener mensajes de un chat
========================================================== */
export const getMessagesByChat = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.id;

    const chat = await chatRepo.findOne({
      where: { id: Number(chatId) },
      relations: ["cliente"],
    });

    if (!chat) return res.status(404).json({ message: "Chat no encontrado" });

    // Si es cliente, solo puede ver su propio chat
    if (req.user!.tipo.toLowerCase() === "cliente" && chat.cliente.id !== userId) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const mensajes = await mensajeRepo.find({
      where: { chat: { id: chat.id } },
      relations: ["usuario", "administrador"],
      order: { fecha: "ASC" },
    });

    return res.json(mensajes);
  } catch (error) {
    return res.status(500).json({ message: "Error obteniendo mensajes", error });
  }
};

/* ==========================================================
   Enviar mensaje a un chat
========================================================== */
export const sendMessageToChat = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const userId = req.user!.id;

    if (!message) return res.status(400).json({ message: "El mensaje no puede estar vacío." });

    const chat = await chatRepo.findOne({
      where: { id: Number(chatId) },
      relations: ["cliente"],
    });

    if (!chat) return res.status(404).json({ message: "Chat no encontrado" });

    let newMessage: Mensaje;

    if (req.user!.tipo.toLowerCase() === "cliente") {
      if (chat.cliente.id !== userId)
        return res.status(403).json({ message: "No autorizado" });

      const user = await userRepo.findOneBy({ id: userId });
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

      newMessage = mensajeRepo.create({
        chat,
        usuario: user,
        administrador: undefined,
        mensaje: message,
        leido: false,
      });
    } else {
      // Admin
      const admin = await userRepo.findOneBy({ id: userId });
      if (!admin) return res.status(404).json({ message: "Administrador no encontrado" });

      newMessage = mensajeRepo.create({
        chat,
        usuario: undefined,
        administrador: admin,
        mensaje: message,
        leido: false,
      });
    }

    await mensajeRepo.save(newMessage);
    return res.status(201).json(newMessage);
  } catch (error) {
    return res.status(500).json({ message: "Error enviando mensaje", error });
  }
};
