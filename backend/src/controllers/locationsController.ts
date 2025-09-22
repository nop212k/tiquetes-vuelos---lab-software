// backend/src/controllers/locationsController.ts
import { Request, Response } from "express";

/**
 * Devuelve lista de ciudades/municipios válidos (puedes ampliar/mover a DB).
 */
const allowedCities = [
  "Bogotá","Medellín","Cali","Cartagena","Pereira","Bucaramanga","Barranquilla","Santa Marta","Manizales","Ibagué","Pasto","Montería","Sincelejo","Villavicencio","Armenia"
];

export const listLocations = (req: Request, res: Response) => {
  res.json({ locations: allowedCities });
};
