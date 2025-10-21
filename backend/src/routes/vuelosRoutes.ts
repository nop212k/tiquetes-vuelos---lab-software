// backend/src/routes/vuelosRoutes.ts
import { Router } from "express";
import {
  createFlight,
  listFlightsAdmin,
  getFlightAdmin,
  updateFlight,
  deleteFlight,
  cancelFlight,
} from "../controllers/adminVuelosController";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validateSchema";
import { createFlightSchema } from "../schemas/flight.schema"; 
import { searchFlights } from "../controllers/getVuelosInSearchFormController";

const router = Router();

// Rutas públicas (listar, ver)
router.get("/", listFlightsAdmin);       // GET /api/flights
router.get("/:id", getFlightAdmin);     // GET /api/flights/:id
router.post("/search", searchFlights);

// Rutas admin protegidas
router.post("/admin", authMiddleware, isAdmin, validateBody(createFlightSchema), createFlight);      // POST /api/flights/admin
router.put("/admin/:id", authMiddleware, isAdmin, validateBody(createFlightSchema), updateFlight);  // PUT /api/flights/admin/:id
router.delete("/admin/:id", authMiddleware, isAdmin, deleteFlight);                                // DELETE /api/flights/admin/:id
router.get("/admin", authMiddleware, isAdmin, listFlightsAdmin);                                   // GET /api/flights/admin
router.patch("/admin/:id/cancel", authMiddleware, isAdmin, cancelFlight); 
export default router;
