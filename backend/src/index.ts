import 'dotenv/config';
import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/data-source';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import rootRoutes from "./routes/rootRoutes";


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


// Inicializar DB y servidor
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => console.log(error));