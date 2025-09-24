// frontend/src/pages/FlightsPage.tsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import CrearVuelosForm from "../components/admin/CrearVuelosForm";
import axios from "axios";

interface Vuelo {
  id: number;
  codigo: string;
  origen: string;
  destino: string;
  horaSalida: string;
  horaLlegada: string;
}

const Admin: React.FC = () => {
  const [vuelos, setVuelos] = useState<Vuelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVuelos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("/api/flights"); // Endpoint que devuelve vuelos
      setVuelos(res.data);
    } catch (err: any) {
      console.error("Error cargando vuelos", err);
      setError("No se pudieron cargar los vuelos. Mostrando datos de ejemplo.");
      // Fallback con datos de prueba
      setVuelos([
        { id: 1, codigo: "AV101", origen: "Bogotá", destino: "Madrid", horaSalida: "2025-09-23T10:00", horaLlegada: "2025-09-23T20:00" },
        { id: 2, codigo: "AV102", origen: "Medellín", destino: "New York", horaSalida: "2025-09-23T12:00", horaLlegada: "2025-09-23T19:00" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVuelos();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Vuelos creados</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <CrearVuelosForm onVuelosCreados={fetchVuelos} />

        {loading ? (
          <p className="mt-6">Cargando vuelos...</p>
        ) : vuelos.length === 0 ? (
          <p className="mt-6">No hay vuelos creados aún.</p>
        ) : (
          <ul className="mt-6">
            {vuelos.map((vuelo) => (
              <li key={vuelo.id} className="border p-2 rounded mb-2 bg-white">
                <strong>{vuelo.codigo}</strong> - {vuelo.origen} → {vuelo.destino} | 
                Salida: {new Date(vuelo.horaSalida).toLocaleString()} | 
                Llegada: {new Date(vuelo.horaLlegada).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Admin;
