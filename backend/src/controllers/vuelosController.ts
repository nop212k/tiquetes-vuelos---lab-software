// backend/src/controllers/vuelosController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Vuelo } from "../models/vuelos";

const vueloRepo = () => AppDataSource.getRepository(Vuelo);

/**
 * GET /api/flights
 * Query params: origin, destination, date, page, limit
 */
export const searchFlights = async (req: Request, res: Response) => {
  try {
    const { origin, destination, date, page = "1", limit = "20" } = req.query as Record<string, string>;

    const repo = vueloRepo();
    const qb = repo.createQueryBuilder("v");

    if (origin) {
      qb.andWhere("LOWER(v.origen) = LOWER(:origin)", { origin });
    }
    if (destination) {
      qb.andWhere("LOWER(v.destino) = LOWER(:destination)", { destination });
    }
    if (date) {
      qb.andWhere("v.fecha = :date", { date });
    }

    // simple pagination
    const take = Math.min(100, parseInt(limit || "20"));
    const skip = (Math.max(1, parseInt(page || "1")) - 1) * take;

    qb.orderBy("v.hora", "ASC").skip(skip).take(take);

    const [results, total] = await qb.getManyAndCount();

    return res.json({
      results,
      meta: { total, page: Number(page), limit: take },
    });
  } catch (error) {
    console.error("searchFlights error:", error);
    return res.status(500).json({ message: "Error buscando vuelos", error: String(error) });
  }
};

export const getFlightById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const repo = vueloRepo();
    const vuelo = await repo.findOneBy({ id: Number(id) });

    if (!vuelo) return res.status(404).json({ message: "Vuelo no encontrado" });

    return res.json({ vuelo });
  } catch (error) {
    console.error("getFlightById error:", error);
    return res.status(500).json({ message: "Error obteniendo vuelo", error: String(error) });
  }
};
