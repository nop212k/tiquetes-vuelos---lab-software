// src/controllers/chatController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Chat } from "../models/Chat";
import { Mensaje } from "../models/Mensaje";
import { User } from "../models/User";
import { IsNull, Not } from "typeorm";


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

    const existingChat = await chatRepo.findOne({
      where: { cliente: { id: userId } },
    });

    if (existingChat) {
      return res.status(400).json({ message: "El chat ya existe." });
    }

    const user = await userRepo.findOneBy({ id: userId });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    const newChat = chatRepo.create({ cliente: user });
    await chatRepo.save(newChat);

    return res.status(201).json(newChat);
  } catch (error) {
    return res.status(500).json({ message: "Error creando el chat", error });
  }
};

/* ==========================================================
   CLIENTE OBTIENE SU CHAT (o lo crea si no existe)
========================================================== */

export const getClientChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // 1️⃣ Obtener solo el chat sin relaciones profundas
    const chat = await chatRepo.findOne({
      where: { cliente: { id: userId } },
      select: ["id", "creado_en"], // evita traer cliente -> chats -> cliente...
    });

    if (!chat) return res.status(404).json({ message: "No tienes un chat creado." });

    // 2️⃣ Obtener mensajes por separado
    const mensajes = await mensajeRepo.find({
      where: { chat: { id: chat.id } },
      relations: ["usuario", "administrador"], // solo estas relaciones
      order: { fecha: "ASC" },
    });

    // Asignar mensajes al chat
    (chat as any).mensajes = mensajes;

    return res.json(chat);
  } catch (error) {
    console.error("Error en getClientChat:", error);
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
    if (!chat) return res.status(404).json({ message: "No tienes un chat creado." });

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
   CLIENTE ENVÍA MENSAJE
========================================================== */
export const sendClientMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "El mensaje no puede estar vacío." });

    const chat = await chatRepo.findOne({ where: { cliente: { id: userId } } });
    if (!chat) return res.status(404).json({ message: "No tienes un chat creado." });

    const user = await userRepo.findOneBy({ id: userId });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    const newMessage = mensajeRepo.create({
      chat,
      usuario: user,
      administrador: undefined,
      mensaje: message,
      leido: false,
    });

    await mensajeRepo.save(newMessage);
    return res.status(201).json(newMessage);
  } catch (error) {
    return res.status(500).json({ message: "Error enviando mensaje", error });
  }
};


/* EL CLIENTE VE QUE TIENE MENSAJES NO LEIDOS */
export const getMensajesNoLeidosCliente = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Obtener el chat del cliente
    const chat = await chatRepo.findOne({ where: { cliente: { id: userId } } });
    if (!chat) return res.status(404).json({ message: "Chat no encontrado." });

    // Contar mensajes de admin no leídos
    const count = await mensajeRepo.count({
      where: {
        chat: { id: chat.id },
        administrador: { id: Not(IsNull()) },
        leido: false,
      },
    });

    return res.json({ tieneNoLeidos: count > 0 });
  } catch (error) {
    return res.status(500).json({ message: "Error obteniendo mensajes no leídos", error });
  }
};

/* ==========================================================
   CLIENTE — MARCAR MENSAJES DE ADMIN COMO LEÍDOS
========================================================== */
export const marcarMensajesLeidosCliente = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Obtener chat del cliente
    const chat = await chatRepo.findOne({ where: { cliente: { id: userId } } });
    if (!chat) return res.status(404).json({ message: "Chat no encontrado." });

    // Marcar como leídos los mensajes de admin
    await mensajeRepo
      .createQueryBuilder()
      .update()
      .set({ leido: true })
      .where("chat_id = :chatId", { chatId: chat.id })
      .andWhere("administrador_id IS NOT NULL") // solo admin
      .andWhere("leido = false")
      .execute();

    return res.status(200).json({ message: "Mensajes marcados como leídos" });
  } catch (error) {
    return res.status(500).json({ message: "Error marcando mensajes", error });
  }
};

/* ==========================================================
   ADMIN ENVÍA MENSAJE
========================================================== */
export const sendAdminMessage = async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.id;
    const { chatId } = req.params;
    const { message } = req.body;

    if (!message) return res.status(400).json({ message: "El mensaje no puede estar vacío." });

    const chat = await chatRepo.findOneBy({ id: Number(chatId) });
    if (!chat) return res.status(404).json({ message: "Chat no encontrado." });

    const admin = await userRepo.findOneBy({ id: adminId });
    if (!admin) return res.status(404).json({ message: "Administrador no encontrado." });

    const newMessage = mensajeRepo.create({
      chat,
      usuario: undefined,
      administrador: admin,
      mensaje: message,
      leido: false,
    });

    await mensajeRepo.save(newMessage);
    return res.status(201).json(newMessage);
  } catch (error) {
    return res.status(500).json({ message: "Error enviando mensaje", error });
  }
};

/* ==========================================================
   ADMIN — OBTIENE TODOS LOS CHATS CON MENSAJES ORDENADOS
========================================================== */
export const getAllChats = async (req: Request, res: Response) => {
  try {
    const chats = await chatRepo
      .createQueryBuilder("chat")
      .leftJoinAndSelect("chat.cliente", "cliente")
      .leftJoinAndSelect("chat.mensajes", "mensaje")
      .leftJoinAndSelect("mensaje.usuario", "usuario")
      .leftJoinAndSelect("mensaje.administrador", "administrador")
      .orderBy("chat.creado_en", "DESC")
      .addOrderBy("mensaje.fecha", "ASC")
      .getMany();

    const chatsConEstado = chats.map(chat => {
      const tieneNoLeidos = chat.mensajes.some(
        m => !m.leido && m.usuario // mensajes de cliente no leídos
      );
      return { ...chat, tieneNoLeidos };
    });

    return res.json(chatsConEstado); // Devuelve todos los mensajes
  } catch (error) {
    return res.status(500).json({ message: "Error obteniendo chats", error });
  }
};

/* ==========================================================
   MARCAR MENSAJES COMO LEÍDOS (cuando admin abre el chat)
========================================================== */
export const marcarMensajesLeidos = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;

    await mensajeRepo
  .createQueryBuilder()
  .update(Mensaje)
  .set({ leido: true })
  .where("chat_id = :chatId", { chatId })
  .andWhere("usuario_id IS NOT NULL") // solo mensajes de cliente
  .andWhere("leido = false")
  .execute();


    return res.status(200).json({ message: "Mensajes marcados como leídos" });
  } catch (error) {
    return res.status(500).json({ message: "Error marcando mensajes", error });
  }
};




/* ==========================================================
   ADMIN — OBTIENE MENSAJES DE UN CHAT
========================================================== */
export const getMessagesByChatId = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const chat = await chatRepo.findOneBy({ id: Number(chatId) });
    if (!chat) return res.status(404).json({ message: "Chat no encontrado." });

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
   ADMIN — OBTIENE UN CHAT POR ID CON MENSAJES
========================================================== */
export const getChatById = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;

    // 1️⃣ Obtener el chat con el cliente
    const chat = await chatRepo.findOne({
      where: { id: Number(chatId) },
      relations: ["cliente"],
    });

    if (!chat) return res.status(404).json({ message: "Chat no encontrado." });

    // 2️⃣ Obtener los mensajes del chat con usuario o administrador
    const mensajes = await mensajeRepo.find({
      where: { chat: { id: chat.id } },
      relations: ["usuario", "administrador"],
      order: { fecha: "ASC" },
    });

    // 3️⃣ Asignar mensajes al chat
    (chat as any).mensajes = mensajes;

    return res.json(chat);
  } catch (error) {
    return res.status(500).json({ message: "Error obteniendo chat", error });
  }
};
