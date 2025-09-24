// backend/src/schemas/auth.schema.ts
import { z } from "zod";

/**
 * Schema para login: login puede ser usuario o correo
 */
export const loginSchema = z.object({
  login: z.string().min(3).refine(
  val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || val.length >= 3,
  { message: "Debe ser un usuario o correo válido" }
),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

/**
 * Schema para registro (ajústalo a los campos reales que esperas en createUser)
 * He respetado los nombres que ya usas en tu User entity: correo, usuario, contrasena, etc.
 */
export const registerSchema = z.object({
  tipoDocumento: z.string().min(1, "Tipo documento requerido"),
  documento: z.string().min(4, "Documento inválido"),
  tipo: z.string().optional(), // puede ser 'cliente' por defecto
  nombres: z.string().min(2, "Ingrese nombres"),
  apellidos: z.string().min(2, "Ingrese apellidos"),
  fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato fecha inválido (YYYY-MM-DD)"),
  lugarNacimiento: z.string().min(2),
  direccion: z.string().min(5),
  genero: z.string().min(1),
  correo: z.string().email("Correo inválido"),
  usuario: z.string().min(3, "Usuario mínimo 3 caracteres"),
  contrasena: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir una mayúscula")
    .regex(/[0-9]/, "Debe incluir un número")
    .regex(/[^A-Za-z0-9]/, "Debe incluir un símbolo"),
  suscritoNoticias: z.boolean().optional(),
});
