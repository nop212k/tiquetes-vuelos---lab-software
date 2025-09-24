// backend/src/routes/vuelosRoutes.ts
import { Router } from "express";
import {
  createFlight,
  listFlightsAdmin,
  getFlightAdmin,
  updateFlight,
  deleteFlight,
} from "../controllers/adminVuelosController";

const router = Router();

// -----------------------------
// ADMIN VUELOS ROUTES
// -----------------------------

// GET /api/vuelos -> Listar vuelos (con búsqueda y paginación)
router.get("/", listFlightsAdmin);

// GET /api/vuelos/:id -> Obtener vuelo por ID
router.get("/:id", getFlightAdmin);

// POST /api/vuelos -> Crear vuelo
router.post("/", createFlight);

// PUT /api/vuelos/:id -> Actualizar vuelo
router.put("/:id", updateFlight);

// DELETE /api/vuelos/:id -> Eliminar vuelo
router.delete("/:id", deleteFlight);

export default router;
