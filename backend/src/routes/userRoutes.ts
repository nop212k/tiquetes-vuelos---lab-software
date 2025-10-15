// backend/src/routes/userRoutes.ts
import { Router } from "express";
import multer from "multer";
import { createUser, /* si existe, exporta createUser */ } from "../controllers/userController";
import { getMe } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Configuración de multer: guarda las fotos en la carpeta "uploads/"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // carpeta donde se guardan las fotos
  },
  filename: (req, file, cb) => {
    // ejemplo: user-123456789.png
    cb(null, `user-${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// registrar usuario con foto
router.post("/register", upload.single("foto"), createUser);

// registrar usuario root (admin)
router.post("/register-root", upload.single("foto"), (req, res, next) => {
  // inyectamos tipo "admin" antes de pasar al controlador
  (req as any).body.tipo = "admin";
  createUser(req, res);
});

// obtener usuario actual (protegido)
router.get("/me", authMiddleware, getMe);

export default router;
