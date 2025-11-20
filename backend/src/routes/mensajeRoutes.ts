// backend/src/routes/mensajeRoutes.ts
import { Router } from "express";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";
import { getMessagesByChat, sendMessageToChat } from "../controllers/mensajeController";

const router = Router();

// Obtener mensajes de un chat
router.get("/:chatId", authMiddleware, getMessagesByChat);

// Enviar mensaje a un chat
router.post("/:chatId", authMiddleware, sendMessageToChat);

export default router;
