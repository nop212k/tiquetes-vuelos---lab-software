// backend/src/routes/userRoutes.ts
import { Router } from "express";
import multer from "multer";
import { 
  createUser, 
  getMe, 
  updateProfile, 
  changePassword 
} from "../controllers/userController";
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

// registrar usuario root
router.post("/register-root", upload.single("foto"), (req, res, next) => {
  // inyectamos tipo "root" antes de pasar al controlador
  (req as any).body.tipo = "root";
  createUser(req, res);
});

// ==================== RUTAS PROTEGIDAS ====================

// Obtener usuario actual
router.get("/me", authMiddleware, getMe);

// Actualizar perfil (nombres, apellidos, email, etc.)
router.put("/me", authMiddleware, updateProfile);

// Cambiar contraseña
router.put("/me/password", authMiddleware, changePassword);

export default router;
