// backend/src/middleware/validateSchema.ts
import { NextFunction, Request, Response } from "express";
import { ZodTypeAny, ZodError } from "zod";

/**
 * Middleware reutilizable para validar req.body contra un schema Zod.
 * Si la validación falla devuelve 400 y estructura:
 * { ok: false, code: "VALIDATION_ERROR", message, details: [{ path, message }] }
 *
 * Uso: router.post("/auth/login", validateBody(loginSchema), loginUser);
 */
export const validateBody = (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    // ZodError tiene .issues (array) con objetos { path: string[], message: string, ... }
    const zErr = result.error as ZodError;
    const errors = zErr.issues.map((issue) => ({
      path: (issue.path || []).join('.'),
      message: issue.message,
    }));
    return res.status(400).json({ ok: false, code: "VALIDATION_ERROR", message: "Datos inválidos", details: errors });
  }
  // Reemplazamos el body por la versión parseada (sanitize)
  req.body = result.data;
  return next();
};
