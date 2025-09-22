import 'dotenv/config';
import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/data-source';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import rootRoutes from "./routes/rootRoutes";
import vuelosRoutes from './routes/vuelosRoutes';
import adminVuelosRoutes from './routes/adminVuelosRoutes';
import { authMiddleware, isAdmin, isRoot } from './middleware/authMiddleware';
import { errorHandler } from "./middleware/errorHandler";
import locationsRoutes from './routes/locationsRoutes';


const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);
app.use('/api', authRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api", rootRoutes);
app.use('/api/flights', vuelosRoutes);
app.use('/api', authMiddleware, isRoot, rootRoutes);
app.use('/api/flights', vuelosRoutes);
app.use('/api/flights/admin', authMiddleware, isAdmin, adminVuelosRoutes);
app.use('/api', locationsRoutes);
app.use(errorHandler);


// Inicializar DB y servidor
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => console.log(error));