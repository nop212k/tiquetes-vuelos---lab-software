// backend/src/controllers/reservasController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Reserva, TipoTransaccion, EstadoTransaccion } from "../models/Reserva";
import { Vuelo } from "../models/vuelos";

// Crear una nueva reserva o compra
export const crearReserva = async (req: Request, res: Response) => {
  try {
    const { vueloId, tipo, numeroPasajeros, notas } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const vueloRepo = AppDataSource.getRepository(Vuelo);
    const vuelo = await vueloRepo.findOne({ where: { id: vueloId } });

    if (!vuelo) {
      return res.status(404).json({ message: "Vuelo no encontrado" });
    }

    if (vuelo.estado === "cancelado") {
      return res.status(400).json({ message: "Este vuelo está cancelado" });
    }

    const reservaRepo = AppDataSource.getRepository(Reserva);
    const precioTotal = Number(vuelo.costoBase) * (numeroPasajeros || 1);

    const nuevaReserva = reservaRepo.create({
      userId,
      vueloId,
      tipo: tipo || TipoTransaccion.RESERVA,
      estado: tipo === TipoTransaccion.COMPRA 
        ? EstadoTransaccion.CONFIRMADO 
        : EstadoTransaccion.PENDIENTE,
      precioTotal,
      numeroPasajeros: numeroPasajeros || 1,
      notas,
    });

    await reservaRepo.save(nuevaReserva);

    const reservaCompleta = await reservaRepo.findOne({
      where: { id: nuevaReserva.id },
      relations: ["usuario", "vuelo"],
    });

    res.status(201).json({
      message: tipo === TipoTransaccion.COMPRA 
        ? "Compra realizada exitosamente" 
        : "Reserva creada exitosamente",
      reserva: reservaCompleta,
    });
  } catch (error: any) {
    console.error("Error creando reserva:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Obtener historial del usuario autenticado
export const obtenerHistorial = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const reservaRepo = AppDataSource.getRepository(Reserva);
    const historial = await reservaRepo.find({
      where: { userId },
      relations: ["vuelo"],
      order: { creadoEn: "DESC" },
    });

    res.json({
      success: true,
      count: historial.length,
      historial,
    });
  } catch (error: any) {
    console.error("Error obteniendo historial:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Obtener una reserva específica
export const obtenerReserva = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const reservaRepo = AppDataSource.getRepository(Reserva);
    const reserva = await reservaRepo.findOne({
      where: { id: Number(id), userId },
      relations: ["vuelo", "usuario"],
    });

    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    res.json({ success: true, reserva });
  } catch (error: any) {
    console.error("Error obteniendo reserva:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Cancelar una reserva o compra
export const cancelarReserva = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { motivoCancelacion } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const reservaRepo = AppDataSource.getRepository(Reserva);
    const reserva = await reservaRepo.findOne({
      where: { id: Number(id), userId },
      relations: ["vuelo"],
    });

    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    if (reserva.estado === EstadoTransaccion.CANCELADO) {
      return res.status(400).json({ message: "Esta reserva ya está cancelada" });
    }

    if (reserva.estado === EstadoTransaccion.COMPLETADO) {
      return res.status(400).json({ message: "No se puede cancelar una reserva completada" });
    }

    // Verificar si el vuelo ya pasó
    const fechaVuelo = new Date(reserva.vuelo.hora);
    const ahora = new Date();
    
    if (fechaVuelo < ahora) {
      return res.status(400).json({ 
        message: "No se puede cancelar una reserva de un vuelo que ya pasó" 
      });
    }

    reserva.estado = EstadoTransaccion.CANCELADO;
    reserva.canceladoEn = new Date();
    reserva.motivoCancelacion = motivoCancelacion || "Cancelado por el usuario";

    await reservaRepo.save(reserva);

    res.json({
      success: true,
      message: "Reserva cancelada exitosamente",
      reserva,
    });
  } catch (error: any) {
    console.error("Error cancelando reserva:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Convertir reserva en compra
export const convertirReservaEnCompra = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const reservaRepo = AppDataSource.getRepository(Reserva);
    const reserva = await reservaRepo.findOne({
      where: { id: Number(id), userId },
      relations: ["vuelo"],
    });

    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    if (reserva.tipo !== TipoTransaccion.RESERVA) {
      return res.status(400).json({ message: "Esta transacción ya es una compra" });
    }

    if (reserva.estado === EstadoTransaccion.CANCELADO) {
      return res.status(400).json({ message: "No se puede comprar una reserva cancelada" });
    }

    reserva.tipo = TipoTransaccion.COMPRA;
    reserva.estado = EstadoTransaccion.CONFIRMADO;

    await reservaRepo.save(reserva);

    res.json({
      success: true,
      message: "Reserva convertida a compra exitosamente",
      reserva,
    });
  } catch (error: any) {
    console.error("Error convirtiendo reserva:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};