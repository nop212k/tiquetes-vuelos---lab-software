// backend/src/routes/adminVuelosRoutes.ts
import { Router } from "express";
import {
  createFlight,
  listFlightsAdmin,
  getFlightAdmin,
  updateFlight,
  deleteFlight
} from "../controllers/adminVuelosController";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";

const router = Router();

// Todas las rutas requieren auth + admin
router.use(authMiddleware, isAdmin);

router.post("/", createFlight);            // POST /api/flights/admin
router.get("/", listFlightsAdmin);         // GET /api/flights/admin
router.get("/:id", getFlightAdmin);        // GET /api/flights/admin/:id
router.put("/:id", updateFlight);          // PUT /api/flights/admin/:id
router.delete("/:id", deleteFlight);       // DELETE /api/flights/admin/:id

export default router;
