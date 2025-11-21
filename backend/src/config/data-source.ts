// backend/src/config/data-source.ts
import { DataSource } from "typeorm";
import { User } from "../models/User";
import { Vuelo } from "../models/vuelos";
import { Reserva } from "../models/Reserva";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false, // Temporalmente true para crear la tabla
  logging: true,
  entities: [User, Vuelo, Reserva], // ✅ Agregamos Reserva
  migrations: [],
  subscribers: [],
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});