// backend/src/controllers/mensajeController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Mensaje } from "../models/Mensaje";
import { Chat } from "../models/Chat";
import { User } from "../models/User";

const mensajeRepo = AppDataSource.getRepository(Mensaje);
const chatRepo = AppDataSource.getRepository(Chat);
const userRepo = AppDataSource.getRepository(User);

/* ================================
   Obtener todos los mensajes de un chat
   - Admin: cualquier chat
   - Cliente: solo su propio chat
================================= */
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
      return res.status(403).json({ message: "No autorizado para ver estos mensajes" });
    }

    const mensajes = await mensajeRepo.find({
      where: { chat: { id: chat.id } },
      relations: ["sender"],
      order: { created_at: "ASC" },
    });

    return res.json(mensajes);
  } catch (error) {
    return res.status(500).json({ message: "Error obteniendo mensajes", error });
  }
};

/* ================================
   Enviar mensaje a un chat
   - Admin o Cliente
================================= */
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

    // Clientes solo pueden enviar a su propio chat
    if (req.user!.tipo.toLowerCase() === "cliente" && chat.cliente.id !== userId) {
      return res.status(403).json({ message: "No autorizado para enviar mensajes a este chat" });
    }

    const user = await userRepo.findOneBy({ id: userId });

    const newMessage = mensajeRepo.create({
      chat,
      sender: user!,
      message,
    });

    await mensajeRepo.save(newMessage);

    return res.status(201).json(newMessage);
  } catch (error) {
    return res.status(500).json({ message: "Error enviando mensaje", error });
  }
};
