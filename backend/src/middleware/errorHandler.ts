// backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";

/**
 * Handler global de errores. Debe montarse AL FINAL de todas las rutas:
 * app.use(errorHandler);
 *
 * Normaliza la respuesta de error en JSON.
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);

  if (res.headersSent) return next(err);

  // Si el error ya tiene formato que usamos (por ejemplo desde validateBody)
  if (err && err.code === "VALIDATION_ERROR") {
    return res.status(400).json({ ok: false, message: err.message, details: err.details || [] });
  }

  // Errores conocidos con status
  const status = typeof err.status === "number" ? err.status : 500;
  const message = err.message || "Error interno del servidor";

  return res.status(status).json({ ok: false, message });
}
