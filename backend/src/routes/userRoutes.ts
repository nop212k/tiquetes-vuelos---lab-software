// backend/src/routes/userRoutes.ts
import { Router } from "express";
import multer from "multer";
import { createUser, /* si existe, exporta createUser */ } from "../controllers/userController";
import { getMe } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const upload = multer();

// registrar usuario con foto
router.post("/register", upload.single("foto"), createUser);

// obtener usuario actual (protegido)
router.get("/me", authMiddleware, getMe);

export default router;
