// backend/src/controllers/publicFlightsController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Vuelo } from "../models/vuelos"; // Asegúrate de tener esta entidad

export const searchFlights = async (req: Request, res: Response) => {
  try {
    const { origin, destination, date, codigoVuelo, precio } = req.body;
    const vueloRepo = AppDataSource.getRepository(Vuelo);

    // Construir query dinámica
    let query = vueloRepo.createQueryBuilder("v");

    if (origin) query = query.andWhere("LOWER(v.origen) LIKE LOWER(:origin)", { origin: `%${origin}%` });
    if (destination) query = query.andWhere("LOWER(v.destino) LIKE LOWER(:destination)", { destination: `%${destination}%` });
    if (date) query = query.andWhere("LOWER(v.hora) LIKE LOWER(:date)", { date: `%${date}%` });
    if (codigoVuelo) query = query.andWhere("LOWER(v.codigo_vuelo) LIKE LOWER(:codigoVuelo)", { codigoVuelo: `%${codigoVuelo}%` });
    if (precio) query = query.andWhere("v.costoBase = :precio", { precio });

    const vuelos = await query.getMany();

    res.json({ results: vuelos });
  } catch (error) {
    console.error("Error buscando vuelos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
