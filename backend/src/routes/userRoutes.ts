// src/routes/userRoutes.ts
import { Router } from "express";
import multer from "multer";
import { createUser } from "../controllers/userController";

const router = Router();

// Configuración de Multer (en memoria)
const upload = multer();

// Ruta para registrar usuario con foto
router.post("/register", upload.single("foto"), createUser);

export default router;
