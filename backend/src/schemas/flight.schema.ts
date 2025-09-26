import * as z from "zod";

export const createFlightSchema = z.object({
  hora: z.string().min(16, "La fecha y hora de salida es obligatoria"), // YYYY-MM-DDTHH:MM
  origen: z.string().min(1, "Origen obligatorio"),
  destino: z.string().min(1, "Destino obligatorio"),
  tiempoVuelo: z.number().min(1, "Tiempo de vuelo obligatorio"),
  esInternacional: z.boolean().optional(),
  horaLlegada: z.string().optional(), // timestamp completo en UTC
  costoBase: z.number().min(0, "Costo base obligatorio"),
  estado: z.string().optional(),
});

export type CreateFlightInput = z.infer<typeof createFlightSchema>;
