// backend/src/controllers/adminVuelosController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Vuelo } from "../models/vuelos";
import { createFlightSchema } from "../schemas/flight.schema";

const repo = () => AppDataSource.getRepository(Vuelo);

// Create flight
export const createFlight = async (req: Request, res: Response) => {
  try {
    const {
      hora, // timestamp de salida completo
      origen,
      destino,
      tiempoVuelo,
      esInternacional = false,
      horaLocalDestino = null, // timestamp de llegada completo
      costoBase,
      estado = "programado",
    } = req.body;

    if (!hora || !origen || !destino || !tiempoVuelo || !costoBase) {
      return res.status(400).json({ message: "Campos obligatorios faltantes" });
    }

    const vuelo = new Vuelo();

    vuelo.codigoVuelo = "AVTEMP";
    
    vuelo.hora = new Date(hora);
    vuelo.origen = String(origen);
    vuelo.destino = String(destino);
    vuelo.tiempoVuelo = Number(tiempoVuelo);
    vuelo.esInternacional = Boolean(esInternacional);
    vuelo.horaLocalDestino = horaLocalDestino ? new Date(horaLocalDestino) : null;
    vuelo.costoBase = typeof costoBase === "number" ? costoBase.toFixed(2) : String(costoBase);
    vuelo.estado = String(estado);

    const parsed = createFlightSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.issues });
    }

    // Guardamos sin código primero
    const saved = await repo().save(vuelo);

    // Generamos código AV consecutivo usando el ID
    saved.codigoVuelo = `AV${saved.id.toString().padStart(3, "0")}`;
    await repo().save(saved);

    return res.status(201).json({ vuelo: saved });
  } catch (error) {
    console.error("createFlight error:", error);
    return res.status(500).json({ message: "Error creando vuelo", error: String(error) });
  }
};

// List flights (admin)
export const listFlightsAdmin = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "50", search } = req.query as Record<string, string>;
    const take = Math.min(200, parseInt(limit || "50"));
    const skip = (Math.max(1, parseInt(page || "1")) - 1) * take;

    const qb = repo().createQueryBuilder("v");
    if (search) {
      qb.where(
        "LOWER(v.codigoVuelo) LIKE :s OR LOWER(v.origen) LIKE :s OR LOWER(v.destino) LIKE :s",
        { s: `%${search.toLowerCase()}%` }
      );
    }

    qb.orderBy("v.hora", "DESC").skip(skip).take(take);

    const [results, total] = await qb.getManyAndCount();
    return res.json({ results, meta: { total, page: Number(page), limit: take } });
  } catch (error) {
    console.error("listFlightsAdmin error:", error);
    return res.status(500).json({ message: "Error listando vuelos", error: String(error) });
  }
};

// Get by id (admin)
export const getFlightAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vuelo = await repo().findOneBy({ id: Number(id) });
    if (!vuelo) return res.status(404).json({ message: "Vuelo no encontrado" });
    return res.json({ vuelo });
  } catch (error) {
    console.error("getFlightAdmin error:", error);
    return res.status(500).json({ message: "Error obteniendo vuelo", error: String(error) });
  }
};

// Update flight
export const updateFlight = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vuelo = await repo().findOneBy({ id: Number(id) });
    if (!vuelo) return res.status(404).json({ message: "Vuelo no encontrado" });

    const body = req.body;
    if (body.codigoVuelo !== undefined) vuelo.codigoVuelo = String(body.codigoVuelo);
    if (body.hora !== undefined) vuelo.hora = new Date(body.hora);
    if (body.origen !== undefined) vuelo.origen = String(body.origen);
    if (body.destino !== undefined) vuelo.destino = String(body.destino);
    if (body.tiempoVuelo !== undefined) vuelo.tiempoVuelo = Number(body.tiempoVuelo);
    if (body.esInternacional !== undefined) vuelo.esInternacional = Boolean(body.esInternacional);
    if (body.horaLocalDestino !== undefined)
      vuelo.horaLocalDestino = body.horaLocalDestino ? new Date(body.horaLocalDestino) : null;
    if (body.costoBase !== undefined)
      vuelo.costoBase = typeof body.costoBase === "number" ? body.costoBase.toFixed(2) : String(body.costoBase);
    if (body.estado !== undefined) vuelo.estado = String(body.estado);

    const updated = await repo().save(vuelo);
    return res.json({ vuelo: updated });
  } catch (error) {
    console.error("updateFlight error:", error);
    return res.status(500).json({ message: "Error actualizando vuelo", error: String(error) });
  }
};

// Delete flight
export const deleteFlight = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vuelo = await repo().findOneBy({ id: Number(id) });
    if (!vuelo) return res.status(404).json({ message: "Vuelo no encontrado" });

    await repo().remove(vuelo);
    return res.json({ message: "Vuelo eliminado" });
  } catch (error) {
    console.error("deleteFlight error:", error);
    return res.status(500).json({ message: "Error eliminando vuelo", error: String(error) });
  }

};

// Cancelar vuelo
export const cancelFlight = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vuelo = await repo().findOneBy({ id: Number(id) });

    if (!vuelo) {
      return res.status(404).json({ message: "Vuelo no encontrado" });
    }

    // Si ya está cancelado, retornamos aviso
    if (vuelo.estado === "cancelado") {
      return res.status(400).json({ message: "El vuelo ya está cancelado" });
    }

    // Solo cambiamos el estado
    vuelo.estado = "cancelado";
    const updated = await repo().save(vuelo);

    return res.json({ message: "Vuelo cancelado correctamente", vuelo: updated });
  } catch (error) {
    console.error("cancelFlight error:", error);
    return res.status(500).json({ message: "Error al cancelar vuelo", error: String(error) });
  }
};
