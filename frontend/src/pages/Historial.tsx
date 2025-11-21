// frontend/src/pages/Historial.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import NavbarCliente from "../components/cliente/NavbarCliente";
import Footer from "../components/Footer";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

interface Vuelo {
  id: number;
  codigoVuelo: string;
  origen: string;
  destino: string;
  hora: string;
  horaLlegada: string;
  costoBase: number;
}

interface Reserva {
  id: number;
  tipo: "reserva" | "compra";
  estado: "pendiente" | "confirmado" | "cancelado" | "completado";
  precioTotal: number;
  numeroPasajeros: number;
  creadoEn: string;
  canceladoEn?: string;
  motivoCancelacion?: string;
  vuelo: Vuelo;
}

const Historial: React.FC = () => {
  const [historial, setHistorial] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"todas" | "reservas" | "compras">("todas");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");
  const [cancelando, setCancelando] = useState<number | null>(null);

  const fetchHistorial = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Debes iniciar sesión");
        return;
      }

      const res = await axios.get(`${API_BASE}/api/reservas/historial`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHistorial(res.data.historial || []);
    } catch (err: any) {
      console.error("Error cargando historial:", err);
      setError(err.response?.data?.message || "Error al cargar el historial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  const handleCancelar = async (id: number) => {
    const confirmacion = window.confirm(
      "¿Estás seguro de que deseas cancelar esta reserva/compra?"
    );
    if (!confirmacion) return;

    setCancelando(id);
    try {
      const token = localStorage.getItem("token");
      const motivo = prompt("Motivo de cancelación (opcional):");

      await axios.put(
        `${API_BASE}/api/reservas/${id}/cancelar`,
        { motivoCancelacion: motivo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Cancelación exitosa");
      fetchHistorial(); // Recargar historial
    } catch (err: any) {
      console.error("Error cancelando:", err);
      alert(err.response?.data?.message || "Error al cancelar");
    } finally {
      setCancelando(null);
    }
  };

  const handleConvertirACompra = async (id: number) => {
    const confirmacion = window.confirm(
      "¿Deseas confirmar la compra de esta reserva?"
    );
    if (!confirmacion) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/api/reservas/${id}/comprar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ ¡Compra confirmada!");
      fetchHistorial();
    } catch (err: any) {
      console.error("Error confirmando compra:", err);
      alert(err.response?.data?.message || "Error al confirmar compra");
    }
  };

  // Filtrar historial
  const historialFiltrado = historial.filter((item) => {
    const matchTipo =
      filtro === "todas" ||
      (filtro === "reservas" && item.tipo === "reserva") ||
      (filtro === "compras" && item.tipo === "compra");

    const matchEstado =
      estadoFiltro === "todos" || item.estado === estadoFiltro;

    return matchTipo && matchEstado;
  });

  const getBadgeClass = (estado: string) => {
    switch (estado) {
      case "confirmado":
        return "bg-green-100 text-green-800";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      case "completado":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case "confirmado":
        return "Confirmado";
      case "pendiente":
        return "Pendiente";
      case "cancelado":
        return "Cancelado";
      case "completado":
        return "Completado";
      default:
        return estado;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarCliente />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📋 Mi Historial
          </h1>
          <p className="text-gray-600">
            Gestiona tus reservas y compras de vuelos
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de transacción
              </label>
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas</option>
                <option value="reservas">Solo reservas</option>
                <option value="compras">Solo compras</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
                <option value="completado">Completado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando historial...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <p className="text-red-700 font-medium">⚠️ {error}</p>
          </div>
        ) : historialFiltrado.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No hay transacciones
            </h3>
            <p className="text-gray-600">
              {filtro === "todas"
                ? "Aún no has realizado reservas o compras"
                : `No tienes ${filtro} registradas`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {historialFiltrado.map((item) => {
              const fechaVuelo = new Date(item.vuelo.hora);
              const yaVolo = fechaVuelo < new Date();
              const puedeEditar = !yaVolo && item.estado !== "cancelado";

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Información principal */}
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.tipo === "compra"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {item.tipo === "compra" ? "💳 Compra" : "📌 Reserva"}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeClass(
                            item.estado
                          )}`}
                        >
                          {getEstadoTexto(item.estado)}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        ✈️ {item.vuelo.origen} → {item.vuelo.destino}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <p>
                          🧾 <span className="font-medium">Código:</span>{" "}
                          {item.vuelo.codigoVuelo}
                        </p>
                        <p>
                          👥 <span className="font-medium">Pasajeros:</span>{" "}
                          {item.numeroPasajeros}
                        </p>
                        <p>
                          🛫 <span className="font-medium">Salida:</span>{" "}
                          {new Date(item.vuelo.hora).toLocaleString("es-CO")}
                        </p>
                        <p>
                          📅 <span className="font-medium">Reservado:</span>{" "}
                          {new Date(item.creadoEn).toLocaleDateString("es-CO")}
                        </p>
                      </div>

                      {item.estado === "cancelado" && item.motivoCancelacion && (
                        <div className="mt-3 p-3 bg-red-50 rounded-md">
                          <p className="text-sm text-red-700">
                            <span className="font-semibold">Motivo:</span>{" "}
                            {item.motivoCancelacion}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Precio y acciones */}
                    <div className="flex flex-col items-end gap-3 min-w-[200px]">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Precio total</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${item.precioTotal.toLocaleString("es-CO")}
                        </p>
                      </div>

                      {puedeEditar && (
                        <div className="flex gap-2 w-full">
                          {item.tipo === "reserva" && item.estado === "pendiente" && (
                            <button
                              onClick={() => handleConvertirACompra(item.id)}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                            >
                              💳 Comprar
                            </button>
                          )}
                          <button
                            onClick={() => handleCancelar(item.id)}
                            disabled={cancelando === item.id}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 text-sm font-semibold"
                          >
                            {cancelando === item.id ? "⏳" : "❌ Cancelar"}
                          </button>
                        </div>
                      )}

                      {yaVolo && item.estado !== "cancelado" && (
                        <span className="text-sm text-gray-500 italic">
                          ✅ Vuelo completado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Historial;