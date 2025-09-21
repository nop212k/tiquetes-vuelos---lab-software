// backend/src/routes/vuelosRoutes.ts
import { Router } from "express";
import { searchFlights, getFlightById } from "../controllers/vuelosController";

const router = Router();

// GET /api/flights
router.get("/", searchFlights);

// GET /api/flights/:id
router.get("/:id", getFlightById);

export default router;
