// frontend/src/pages/FlightsPage.tsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/admin/NavbarAdmin";

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

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
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/flights`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });;
      console.log("API response:", res.data);

      // Tomamos los vuelos de la API si existen, sino usamos los de ejemplo
      const vuelosAPI: Vuelo[] = res.data.results && res.data.results.length > 0 
        ? res.data.results 
        : [
            { id: 1, codigo: "AV101", origen: "Bogotá", destino: "Madrid", horaSalida: "2025-09-23T10:00", horaLlegada: "2025-09-23T20:00" },
            { id: 2, codigo: "AV102", origen: "Medellín", destino: "New York", horaSalida: "2025-09-23T12:00", horaLlegada: "2025-09-23T19:00" },
          ];

      setVuelos(vuelosAPI);

    } catch (err: any) {
      console.error("Error cargando vuelos", err);
      setError("No se pudieron cargar los vuelos. Mostrando datos de ejemplo.");

      // Fallback solo con datos de ejemplo
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
      <div className="container mx-auto p-4 shadow-lg min-h-screen"
            style={{
                    backgroundImage: "url('/images/fondoAdmin.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}>
        <h1 className="text-2xl font-bold mb-4 text-white drop-shadow-lg">
          Vuelos creados
        </h1>

        {error && <p className="text-red-400 mb-4">{error}</p>}       

        {loading ? (<p className="mt-6">Cargando vuelos...</p>): 
                    vuelos.length === 0 ? (<p className="mt-6">No hay vuelos creados aún.</p>):
                    (<ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {vuelos.map((vuelo) => (
                          <li key={vuelo.id}
                              className="bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition">
                                <div className="flex justify-between items-center mb-2">
                                  <h2 className="text-lg font-bold text-blue-600">{vuelo.codigo}</h2>
                                  <span className="text-sm text-gray-500">ID: {vuelo.id}</span>
                                </div>
                                  <p className="text-gray-700">
                                    <span className="font-medium">Origen:</span> {vuelo.origen}
                                  </p>
                                  <p className="text-gray-700">
                                    <span className="font-medium">Destino:</span> {vuelo.destino}
                                  </p>
                                <div className="mt-3 text-sm text-gray-600">
                                  <p>
                                    <span className="font-medium text-green-600">Salida:</span>{" "}
                                          {vuelo.horaSalida ? new Date(vuelo.horaSalida).toLocaleString() : "-"}
                                  </p>
                                  <p>
                                    <span className="font-medium text-red-600">Llegada:</span>{" "}
                                          {vuelo.horaLlegada ? new Date(vuelo.horaLlegada).toLocaleString() : "-"}
                                  </p>
                                </div>
                          </li>
                        ))}
                    </ul>)}
      </div>
    </div>
  );
};

export default Admin;
