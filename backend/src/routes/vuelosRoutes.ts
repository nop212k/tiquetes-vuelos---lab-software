import { Router } from "express";
import {
  createFlight,
  listFlightsAdmin,
  getFlightAdmin,
  updateFlight,
  deleteFlight,
} from "../controllers/adminVuelosController";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validateSchema";
import { createFlightSchema } from "../schemas/flight.schema"; // tu schema Zod

const router = Router();

// -----------------------------
// ADMIN VUELOS ROUTES
// -----------------------------

// GET /api/vuelos -> Listar vuelos (con búsqueda y paginación)
router.get("/", listFlightsAdmin);

// GET /api/vuelos/:id -> Obtener vuelo por ID
router.get("/:id", getFlightAdmin);

// POST /api/vuelos -> Crear vuelo (solo admin) con validación
router.post("/", authMiddleware, isAdmin, validateBody(createFlightSchema), createFlight);

// PUT /api/vuelos/:id -> Actualizar vuelo
router.put("/:id", authMiddleware, isAdmin, validateBody(createFlightSchema), updateFlight);

// DELETE /api/vuelos/:id -> Eliminar vuelo
router.delete("/:id", authMiddleware, isAdmin, deleteFlight);

export default router;
