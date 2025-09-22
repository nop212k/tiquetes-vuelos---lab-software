// backend/src/routes/authRoutes.ts
import { Router } from "express";
import { loginUser, forgotPassword, resetPassword } from "../controllers/authController";
import { validateBody } from "../middleware/validateSchema";
import { loginSchema } from "../schemas/auth.schema";

const router = Router();

// ahora valida
router.post("/auth/login", validateBody(loginSchema), loginUser);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);

export default router;
