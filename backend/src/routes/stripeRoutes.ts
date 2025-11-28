// backend/src/routes/stripeRoutes.ts
import { Router } from "express";
import { crearPaymentIntent, verificarPago } from "../controllers/stripeController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Crear PaymentIntent para iniciar el proceso de pago
router.post("/create-payment-intent", crearPaymentIntent);

// Verificar estado de un pago
router.get("/verify-payment/:paymentIntentId", verificarPago);

export default router;