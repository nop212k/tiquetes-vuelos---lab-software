import { Router } from "express";
import { listLocations } from "../controllers/locationsController";

const router = Router();
router.get("/locations", listLocations);
export default router;
