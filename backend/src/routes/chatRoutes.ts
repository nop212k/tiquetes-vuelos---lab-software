
import { Router } from "express";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";
import {
  createClientChat,
  getClientChat,
  getClientMessages,
  sendClientMessage,
  getAllChats,
  getChatById,
  getMessagesByChatId,
  sendAdminMessage
} from "../controllers/chatController";

const router = Router();

/* =======================
   RUTAS PARA CLIENTES
======================= */

// Cliente crea su chat (solo uno)
router.post("/", authMiddleware, createClientChat);

// Cliente obtiene su chat
router.get("/", authMiddleware, getClientChat);

// Cliente obtiene sus mensajes
router.get("/messages", authMiddleware, getClientMessages);

// Cliente envía mensaje en su chat
router.post("/messages", authMiddleware, sendClientMessage);


/* =======================
   RUTAS PARA ADMIN
======================= */

// Admin ve todos los chats
router.get("/all", authMiddleware, isAdmin, getAllChats);

// Admin ve un chat por ID
router.get("/:chatId", authMiddleware, isAdmin, getChatById);

// Admin obtiene mensajes de un chat
router.get("/:chatId/messages", authMiddleware, isAdmin, getMessagesByChatId);

// Admin envía mensaje en un chat específico
router.post("/:chatId/messages", authMiddleware, isAdmin, sendAdminMessage);

export default router;
