import { Router } from "express";
import { loginUser } from "../controllers/authController";

const router = Router();

router.post("/auth/login", loginUser);

export default router;