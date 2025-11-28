import 'dotenv/config';
import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/data-source';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import rootRoutes from "./routes/rootRoutes";
import vuelosRoutes from './routes/vuelosRoutes';
import { authMiddleware, isRoot } from './middleware/authMiddleware';
import { errorHandler } from "./middleware/errorHandler";
import cityRoutes from "./routes/cityCountries";
import chatRoutes from "./routes/chatRoutes";
import mensajeRoutes from "./routes/mensajeRoutes";
import reservasRoutes from "./routes/reservasRoutes";
import stripeRoutes from "./routes/stripeRoutes"; // ✅ AGREGADO: Import de rutas de Stripe

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Archivos estáticos
app.use("/uploads", express.static("uploads"));

// ============ RUTAS PÚBLICAS Y DE AUTH ============
app.use('/api', authRoutes);
app.use('/api/cities', cityRoutes);

// ============ RUTAS DE USUARIOS ============
app.use('/api/users', userRoutes);

// ============ RUTAS DE VUELOS ============
app.use('/api/flights', vuelosRoutes);

// ============ RUTAS DE CHAT ============
app.use('/api/chats', chatRoutes);
app.use('/api/messages', mensajeRoutes);

// ============ RUTAS DE RESERVAS (para clientes autenticados) ============
app.use("/api/reservas", reservasRoutes);

// ============ RUTAS DE STRIPE (pagos) ============
app.use("/api/stripe", stripeRoutes); // ✅ AGREGADO: Rutas de Stripe

// ============ RUTAS DE ROOT (solo usuarios root) ============
app.use('/api/root', authMiddleware, isRoot, rootRoutes);

// ============ MANEJO DE ERRORES (siempre al final) ============
app.use(errorHandler);

// Inicializar DB y servidor
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error: any) => console.log(error));