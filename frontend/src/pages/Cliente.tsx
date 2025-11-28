// frontend/src/pages/Cliente.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/cliente/NavbarCliente";
import Footer from "../components/Footer";
import "./Cliente.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

interface Vuelo {
  id: number;
  codigoVuelo?: string;
  codigo?: string;
  origen: string;
  destino: string;
  hora?: string;
  horaSalida?: string;
  horaLlegada?: string;
  costoBase?: number;
  precio?: number;
  estado?: string;
  esInternacional?: boolean;
}

const Cliente: React.FC = () => {
  const navigate = useNavigate();
  const [vuelos, setVuelos] = useState<Vuelo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ✅ ELIMINADO: const [procesando, setProcesando] = useState<number | null>(null);
  // Ya no se necesita porque no procesamos aquí, vamos al checkout

  const fetchVuelos = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/flights`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const vuelosData = res.data.results || res.data.vuelos || res.data || [];
      
      // Filtrar solo vuelos disponibles (no cancelados)
      const vuelosDisponibles = vuelosData.filter(
        (v: Vuelo) => v.estado !== "cancelado"
      );

      setVuelos(vuelosDisponibles);
    } catch (err: any) {
      console.error("Error cargando vuelos:", err);
      setError("No se pudieron cargar los vuelos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVuelos();
  }, []);

  // ✅ MODIFICADO: handleReservar ahora redirige al checkout
  const handleReservar = (vuelo: Vuelo) => {
    const confirmacion = window.confirm(
      `¿Deseas reservar el vuelo ${vuelo.origen} → ${vuelo.destino}?\n\nSerás redirigido a la página de pago.`
    );
    if (!confirmacion) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión para reservar");
      navigate("/login");
      return;
    }

    // Redirigir al checkout con los datos del vuelo
    navigate("/checkout", {
      state: {
        vueloId: vuelo.id,
        numeroPasajeros: 1,
        tipo: "reserva",
        vuelo: {
          origen: vuelo.origen,
          destino: vuelo.destino,
          codigo: vuelo.codigoVuelo || vuelo.codigo || "N/A",
          precio: vuelo.costoBase || vuelo.precio || 0,
        },
      },
    });
  };

  // ✅ MODIFICADO: handleComprar ahora redirige al checkout
  const handleComprar = (vuelo: Vuelo) => {
    const confirmacion = window.confirm(
      `¿Deseas comprar el vuelo ${vuelo.origen} → ${vuelo.destino}?\nPrecio: $${(
        vuelo.costoBase || vuelo.precio || 0
      ).toLocaleString("es-CO")}\n\nSerás redirigido a la página de pago.`
    );
    if (!confirmacion) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión para comprar");
      navigate("/login");
      return;
    }

    // Redirigir al checkout con los datos del vuelo
    navigate("/checkout", {
      state: {
        vueloId: vuelo.id,
        numeroPasajeros: 1,
        tipo: "compra",
        vuelo: {
          origen: vuelo.origen,
          destino: vuelo.destino,
          codigo: vuelo.codigoVuelo || vuelo.codigo || "N/A",
          precio: vuelo.costoBase || vuelo.precio || 0,
        },
      },
    });
  };

  const formatFecha = (fecha?: string) => {
    if (!fecha) return "Por definir";
    try {
      return new Date(fecha).toLocaleString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return fecha;
    }
  };

  return (
    <div className="page">
      <Navbar />

      <main className="cliente-main">
        <header className="cliente-header">
          <h1>🎯 Panel de Cliente</h1>
          <p>Encuentra y reserva tus vuelos favoritos</p>
        </header>

        <section className="cliente-dashboard">
          <div className="card card--wide">
            <div className="flex justify-between items-center mb-6">
              <h2>✈️ Vuelos disponibles</h2>
              <button
                onClick={() => navigate("/search")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                🔍 Buscar vuelos
              </button>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando vuelos...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {!loading && vuelos.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✈️</div>
                <p className="text-gray-600">
                  No hay vuelos disponibles en este momento
                </p>
              </div>
            )}

            {!loading && vuelos.length > 0 && (
              <ul className="flights-grid">
                {vuelos.map((v) => {
                  const codigo = v.codigoVuelo || v.codigo || "N/A";
                  const horaSalida = v.hora || v.horaSalida;
                  const precio = v.costoBase || v.precio || 0;

                  return (
                    <li key={v.id} className="flight-card">
                      <div className="flight-header">
                        <p className="flight-route">
                          {v.origen} → {v.destino}
                        </p>
                        <span className="flight-code">{codigo}</span>
                        {v.esInternacional && (
                          <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold ml-2">
                            🌍 Internacional
                          </span>
                        )}
                      </div>

                      <p className="flight-info">
                        🛫 Salida: {formatFecha(horaSalida)}
                      </p>
                      <p className="flight-info">
                        🛬 Llegada: {formatFecha(v.horaLlegada)}
                      </p>
                      <p className="flight-price">
                        💲 ${precio.toLocaleString("es-CO")} COP
                      </p>

                      {/* ✅ MODIFICADO: Eliminado disabled={procesando === v.id} */}
                      <div className="flight-actions">
                        <button
                          onClick={() => handleReservar(v)}
                          className="btn"
                        >
                          📌 Reservar
                        </button>
                        <button
                          onClick={() => handleComprar(v)}
                          className="btn btn--secondary"
                        >
                          💳 Comprar
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="card">
            <h2>📋 Accesos rápidos</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/historial")}
                className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                📜 Ver mi historial
              </button>
              <button
                onClick={() => navigate("/perfil-cliente")}
                className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition"
              >
                👤 Mi perfil
              </button>
              <button
                onClick={() => navigate("/search")}
                className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
              >
                🔍 Buscar vuelos específicos
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Cliente;