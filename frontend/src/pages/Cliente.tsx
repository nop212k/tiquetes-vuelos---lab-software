// frontend/src/pages/ClientePage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/cliente/NavbarCliente";
import Footer from "../components/Footer";
import "./Cliente.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

interface Vuelo {
  id: number;
  codigo: string;
  origen: string;
  destino: string;
  horaSalida: string;
  horaLlegada: string;
  precio: number;
}

interface Reserva {
  id: number;
  vuelo: string;
  estado: "Reservado" | "Comprado" | "Cancelado";
}

const Cliente: React.FC = () => {
  const [vuelos, setVuelos] = useState<Vuelo[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Traer vuelos disponibles
  const fetchVuelos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/flights`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setVuelos(
        res.data.results && res.data.results.length > 0
          ? res.data.results
          : [
              {
                id: 1,
                codigo: "AV101",
                origen: "Bogotá",
                destino: "Madrid",
                horaSalida: "2025-09-23T10:00",
                horaLlegada: "2025-09-23T20:00",
                precio: 1200,
              },
              {
                id: 2,
                codigo: "AV102",
                origen: "Medellín",
                destino: "New York",
                horaSalida: "2025-09-23T12:00",
                horaLlegada: "2025-09-23T19:00",
                precio: 950,
              },
            ]
      );
    } catch (err) {
      setError("No se pudieron cargar los vuelos. Mostrando datos de ejemplo.");
      setVuelos([
        {
          id: 1,
          codigo: "AV101",
          origen: "Bogotá",
          destino: "Madrid",
          horaSalida: "2025-09-23T10:00",
          horaLlegada: "2025-09-23T20:00",
          precio: 1200,
        },
        {
          id: 2,
          codigo: "AV102",
          origen: "Medellín",
          destino: "New York",
          horaSalida: "2025-09-23T12:00",
          horaLlegada: "2025-09-23T19:00",
          precio: 950,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Reservas simuladas
  const fetchReservas = async () => {
    setReservas([
      { id: 1, vuelo: "Bogotá → Miami", estado: "Reservado" },
      { id: 2, vuelo: "Medellín → Madrid", estado: "Comprado" },
      { id: 3, vuelo: "Cali → Buenos Aires", estado: "Cancelado" },
    ]);
  };

  useEffect(() => {
    fetchVuelos();
    fetchReservas();
  }, []);

  return (
    <div className="page">
      <Navbar />

      <main className="cliente-main">
        {/* Header */}
        <header className="cliente-header">
          <h1>🎯 Panel de Cliente</h1>
          <p>Gestiona tus vuelos, reservas y perfil desde un solo lugar.</p>
        </header>

        {/* Dashboard */}
        <section className="cliente-dashboard">
          {/* Buscar vuelos */}
          <div className="card card--wide">
            <h2>🔍 Buscar vuelos</h2>
            {loading && <p>Cargando vuelos...</p>}
            {error && <p className="error">{error}</p>}

            {vuelos.length > 0 ? (
              <ul className="flights-grid">
                {vuelos.map((v) => (
                  <li key={v.id} className="flight-card">
                    <div className="flight-header">
                      <p className="flight-route">
                        {v.origen} → {v.destino}
                      </p>
                      <span className="flight-code">{v.codigo}</span>
                    </div>

                    <p className="flight-info">
                      🛫 Salida:{" "}
                      {v.horaSalida
                        ? new Date(v.horaSalida).toLocaleString("es-CO")
                        : "Por definir"}
                    </p>
                    <p className="flight-info">
                      🛬 Llegada:{" "}
                      {v.horaLlegada
                        ? new Date(v.horaLlegada).toLocaleString("es-CO")
                        : "Por definir"}
                    </p>
                    <p className="flight-price">💲 {v.precio}</p>

                    <div className="flight-actions">
                      <button className="btn">Reservar</button>
                      <button className="btn btn--secondary">Comprar</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay vuelos disponibles</p>
            )}
          </div>

          {/* Mis reservas */}
          <div className="card">
            <h2>🎟️ Mis reservas y compras</h2>
            <ul className="list">
              {reservas.map((r) => (
                <li key={r.id} className={r.estado.toLowerCase()}>
                  ✈️ {r.vuelo} <span>({r.estado})</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Cliente;
