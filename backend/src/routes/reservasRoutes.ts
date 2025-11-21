// backend/src/routes/reservasRoutes.ts
import { Router } from "express";
import {
  crearReserva,
  obtenerHistorial,
  obtenerReserva,
  cancelarReserva,
  convertirReservaEnCompra,
} from "../controllers/reservasController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Crear nueva reserva/compra
router.post("/", crearReserva);

// Obtener historial del usuario
router.get("/historial", obtenerHistorial);

// Obtener una reserva específica
router.get("/:id", obtenerReserva);

// Cancelar reserva
router.put("/:id/cancelar", cancelarReserva);

// Convertir reserva en compra
router.put("/:id/comprar", convertirReservaEnCompra);

export default router;