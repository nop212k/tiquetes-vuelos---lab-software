import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Chat } from "../models/Chat";
import { Mensaje } from "../models/Mensaje";
import { User } from "../models/User";

/* ==========================================================
   REPOSITORIOS
========================================================== */
const chatRepo = AppDataSource.getRepository(Chat);
const mensajeRepo = AppDataSource.getRepository(Mensaje);
const userRepo = AppDataSource.getRepository(User);

/* ==========================================================
   CLIENTE CREA SU CHAT (SOLO UNO)
========================================================== */
export const createClientChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Verificar si ya existe un chat del cliente
    const existingChat = await chatRepo.findOne({
      where: { cliente: { id: userId } },
    });

    if (existingChat) {
      return res.status(400).json({ message: "El chat ya existe." });
    }

    const user = await userRepo.findOneBy({ id: userId });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const newChat = chatRepo.create({ cliente: user });
    await chatRepo.save(newChat);

    return res.status(201).json(newChat);
  } catch (error) {
    return res.status(500).json({ message: "Error creando el chat", error });
  }
};

/* ==========================================================
   CLIENTE OBTIENE SU CHAT
========================================================== */
export const getClientChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const chat = await chatRepo.findOne({
      where: { cliente: { id: userId } },
      relations: ["mensajes", "mensajes.sender"],
      order: { mensajes: { created_at: "ASC" } },
    });

    if (!chat) {
      return res.status(404).json({ message: "No tienes un chat creado." });
    }

    return res.json(chat);
  } catch (error) {
    return res.status(500).json({ message: "Error obteniendo chat", error });
  }
};

/* ==========================================================
   CLIENTE OBTIENE SUS MENSAJES
========================================================== */
export const getClientMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const chat = await chatRepo.findOne({
      where: { cliente: { id: userId } },
    });

    if (!chat) {
      return res.status(404).json({ message: "No tienes un chat creado." });
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

/* ==========================================================
   CLIENTE ENVÍA UN MENSAJE
========================================================== */
export const sendClientMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "El mensaje no puede estar vacío." });
    }

    const chat = await chatRepo.findOne({
      where: { cliente: { id: userId } },
    });

    if (!chat) {
      return res.status(404).json({ message: "No tienes un chat creado." });
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

/* ==========================================================
   ADMIN — OBTIENE TODOS LOS CHATS
========================================================== */
export const getAllChats = async (req: Request, res: Response) => {
  try {
    const chats = await chatRepo.find({
      relations: ["cliente"],
      order: { creado_en: "DESC" },
    });

    return res.json(chats);
  } catch (error) {
    return res.status(500).json({ message: "Error obteniendo chats", error });
  }
};

/* ==========================================================
   ADMIN — OBTIENE UN CHAT POR ID
========================================================== */
export const getChatById = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;

    const chat = await chatRepo.findOne({
      where: { id: Number(chatId) },
      relations: ["cliente"],
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat no encontrado." });
    }

    return res.json(chat);
  } catch (error) {
    return res.status(500).json({ message: "Error obteniendo chat", error });
  }
};

/* ==========================================================
   ADMIN — OBTIENE MENSAJES DE UN CHAT
========================================================== */
export const getMessagesByChatId = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;

    const mensajes = await mensajeRepo.find({
      where: { chat: { id: Number(chatId) } },
      relations: ["sender"],
      order: { created_at: "ASC" },
    });

    return res.json(mensajes);
  } catch (error) {
    return res.status(500).json({ message: "Error obteniendo mensajes", error });
  }
};

/* ==========================================================
   ADMIN — ENVÍA MENSAJE A UN CHAT ESPECÍFICO
========================================================== */
export const sendAdminMessage = async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.id;
    const { chatId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "El mensaje no puede estar vacío." });
    }

    const chat = await chatRepo.findOneBy({ id: Number(chatId) });

    if (!chat) {
      return res.status(404).json({ message: "Chat no encontrado." });
    }

    const admin = await userRepo.findOneBy({ id: adminId });

    const newMessage = mensajeRepo.create({
      chat,
      sender: admin!,
      message,
    });

    await mensajeRepo.save(newMessage);

    return res.status(201).json(newMessage);
  } catch (error) {
    return res.status(500).json({ message: "Error enviando mensaje", error });
  }
};
