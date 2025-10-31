// backend/src/controllers/getVuelosInSearchFormController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Vuelo } from "../models/vuelos";

export const searchFlights = async (req: Request, res: Response) => {
  try {
    const { origin, destination, date, codigoVuelo, precio } = req.body;
    
    console.log("📋 Búsqueda recibida:", { origin, destination, date, codigoVuelo, precio });
    
    const vueloRepo = AppDataSource.getRepository(Vuelo);

    // Construir query dinámica
    let query = vueloRepo.createQueryBuilder("v");

    // Solo buscar vuelos que no estén cancelados
    query = query.andWhere("v.estado != :estado", { estado: "cancelado" });

    // Filtros dinámicos
    if (origin) {
      query = query.andWhere("LOWER(v.origen) LIKE LOWER(:origin)", { 
        origin: `%${origin.trim()}%` 
      });
    }
    
    if (destination) {
      query = query.andWhere("LOWER(v.destino) LIKE LOWER(:destination)", { 
        destination: `%${destination.trim()}%` 
      });
    }
    
    if (date) {
      // Buscar por fecha sin importar la hora
      query = query.andWhere("DATE(v.hora) = :date", { date });
    }
    
    if (codigoVuelo) {
      query = query.andWhere("LOWER(v.codigoVuelo) LIKE LOWER(:codigoVuelo)", { 
        codigoVuelo: `%${codigoVuelo.trim()}%` 
      });
    }
    
    if (precio) {
      query = query.andWhere("v.costoBase <= :precio", { precio: Number(precio) });
    }

    // Ordenar por fecha de salida
    query = query.orderBy("v.hora", "ASC");

    const vuelos = await query.getMany();

    console.log(`✅ Se encontraron ${vuelos.length} vuelos`);

    res.json({ 
      success: true,
      count: vuelos.length,
      results: vuelos 
    });

  } catch (error: any) {
    console.error("❌ Error buscando vuelos:", error);
    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};