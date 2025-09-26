// frontend/src/pages/FlightsPage.tsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/admin/NavbarAdmin";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

interface Vuelo {
  id: number;
  codigoVuelo?: string;
  codigo?: string;
  origen: string;
  destino: string;
  fecha?: string;         // opcional
  hora?: string;          // opcional
  horaSalida?: string;    // ISO o YYYY-MM-DDTHH:MM
  horaLlegada?: string;   // ISO o YYYY-MM-DDTHH:MM
  tiempoVuelo?: number;   // minutos (fallback)
  horaLocalDestino?: string | null;
  costoBase?: string | number;
  estado?: string;
  esInternacional?: boolean;
  creadoEn?: string;
  actualizadoEn?: string;
}

function formatDateTime(fecha?: string) {
  if (!fecha) return "-";
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return fecha;
  return d.toLocaleString("es-CO", {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });
}

/** Calcula duración entre dos timestamps; si falla, usa minutos fallback */
function computeDuration(horaInicio?: string, horaFin?: string, fallbackMins?: number) {
  if (horaInicio && horaFin) {
    const a = new Date(horaInicio);
    const b = new Date(horaFin);
    if (!isNaN(a.getTime()) && !isNaN(b.getTime())) {
      let diff = Math.abs(b.getTime() - a.getTime()); // ms
      const totalMin = Math.round(diff / 60000);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      if (h === 0) return `${m} min`;
      return m === 0 ? `${h} h` : `${h} h ${m} min`;
    }
  }
  if (fallbackMins != null && !isNaN(Number(fallbackMins))) {
    const m = Number(fallbackMins);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r === 0 ? `${h} h` : `${h} h ${r} min`;
  }
  return "-";
}

function formatCOP(value?: string | number) {
  const n = Number(value);
  if (isNaN(n)) return "-";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(n);
}

function badgeForEstado(estado?: string) {
  const e = (estado || "programado").toLowerCase();
  if (e.includes("cancel")) return { label: "Cancelado", className: "bg-red-600 text-white" };
  if (e.includes("en vuelo") || e.includes("active") || e.includes("en-vuelo")) return { label: "En vuelo", className: "bg-green-600 text-white" };
  return { label: estado ? (estado.charAt(0).toUpperCase() + estado.slice(1)) : "Programado", className: "bg-sky-600 text-white" };
}

const Admin: React.FC = () => {
  const [vuelos, setVuelos] = useState<Vuelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Vuelo | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVuelos = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/flights`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = res.data;
      const arr: Vuelo[] = Array.isArray(data) ? data : data.results ?? data.vuelos ?? data;
      setVuelos(arr);
    } catch (err: any) {
      console.error("Error cargando vuelos", err);
      setError("No se pudieron cargar los vuelos desde el servidor. Mostrando datos de ejemplo.");
      setVuelos([
        { id: 1, codigoVuelo: "AV101", origen: "Bogotá", destino: "Madrid", horaSalida: "2025-09-23T10:00:00", horaLlegada: "2025-09-23T20:00:00", tiempoVuelo: 600, costoBase: "1500000", estado: "programado" },
        { id: 2, codigoVuelo: "AV102", origen: "Medellín", destino: "New York", horaSalida: "2025-09-23T12:00:00", horaLlegada: "2025-09-23T19:00:00", tiempoVuelo: 420, costoBase: "2200000", estado: "programado" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVuelos(); }, []);

  const handleDelete = async (id: number) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/api/flights/admin/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setVuelos(prev => prev.filter(v => v.id !== id));
      setConfirmDeleteId(null);
    } catch (err: any) {
      console.error("Error borrando vuelo", err);
      alert(err?.response?.data?.message || "Error al eliminar el vuelo");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div
        className="max-w-7xl mx-auto px-4 py-8"
        style={{
          backgroundImage: "linear-gradient(rgba(6,12,20,0.35), rgba(6,12,20,0.12)), url('/images/fondoAdmin.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          
        }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-white drop-shadow-md">Vuelos creados</h1>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-6">{error}</div>}

        {loading ? (
          <div className="text-center py-16 text-white/80">Cargando vuelos...</div>
        ) : vuelos.length === 0 ? (
          <div className="text-center py-12 text-white/80">No hay vuelos creados aún.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vuelos.map((v) => {
              const codigo = v.codigoVuelo || v.codigo || "—";
              const badge = badgeForEstado(v.estado);
              // duración: preferimos horaSalida/horaLlegada, si no, fallback a tiempoVuelo
              const dur = computeDuration(v.horaSalida ?? v.fecha ?? v.hora, v.horaLlegada ?? undefined, v.tiempoVuelo);
              return (
                <article key={v.id} className="bg-white/95 rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-900 truncate">{codigo}</h3>
                          {v.esInternacional && <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">Internacional</span>}
                        </div>
                        <p className="text-sm text-slate-600 mt-1 truncate">{v.origen} → {v.destino}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-extrabold text-slate-900">{formatCOP(v.costoBase)}</div>
                        <div className="mt-2">
                          <span className={`inline-block px-3 py-1 text-xs rounded-full ${badge.className}`}>{badge.label}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
                      <div>
                        <div className="text-xs text-slate-500">Salida</div>
                        <div className="font-medium">{formatDateTime(v.horaSalida ?? v.fecha ?? v.hora)}</div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Duración</div>
                        <div className="font-medium">{dur}</div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Hora local destino</div>
                        <div className="font-medium">{v.horaLocalDestino ?? "-"}</div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Creado</div>
                        <div className="font-medium text-slate-600">{v.creadoEn ? new Date(v.creadoEn).toLocaleString() : "-"}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="text-sm text-slate-500">ID: <span className="font-medium text-slate-700">{v.id}</span></div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(v)}
                          className="px-3 py-2 rounded-md border border-sky-600 text-sky-600 hover:bg-sky-50 text-sm"
                        >
                          Ver
                        </button>

                        <button
                          onClick={() => (window.location.href = `/crear-vuelos?edit=${v.id}`)}
                          className="px-3 py-2 rounded-md bg-amber-400 text-slate-900 hover:bg-amber-500 text-sm"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => {
                            if (confirmDeleteId === v.id) handleDelete(v.id);
                            else setConfirmDeleteId(v.id);
                          }}
                          className={`px-3 py-2 rounded-md text-sm ${confirmDeleteId === v.id ? "bg-red-600 text-white" : "bg-white border border-slate-200 text-slate-700"} hover:shadow`}
                          disabled={deleting && confirmDeleteId === v.id}
                        >
                          {confirmDeleteId === v.id ? (deleting ? "Eliminando..." : "Confirmar borrar") : "Eliminar"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal detalle */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-auto">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{selected.codigoVuelo || selected.codigo}</h2>
                  <p className="text-sm text-slate-600 mt-1">{selected.origen} → {selected.destino}</p>
                </div>
                <div>
                  <div className="text-right font-extrabold text-xl">{formatCOP(selected.costoBase)}</div>
                  <div className="text-sm text-slate-500 mt-2">ID: {selected.id}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 text-sm text-slate-700">
                <div>
                  <div className="text-xs text-slate-500">Salida</div>
                  <div className="font-medium">{formatDateTime(selected.horaSalida ?? selected.fecha ?? selected.hora)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Llegada</div>
                  <div className="font-medium">{formatDateTime(selected.horaLlegada)}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">Duración</div>
                  <div className="font-medium">{computeDuration(selected.horaSalida ?? selected.fecha ?? selected.hora, selected.horaLlegada, selected.tiempoVuelo)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Hora local destino</div>
                  <div className="font-medium">{selected.horaLocalDestino ?? "-"}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">Creado</div>
                  <div className="font-medium">{selected.creadoEn ? new Date(selected.creadoEn).toLocaleString() : "-"}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">Actualizado</div>
                  <div className="font-medium">{selected.actualizadoEn ? new Date(selected.actualizadoEn).toLocaleString() : "-"}</div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-md border">Cerrar</button>
                <button onClick={() => (window.location.href = `/crear-vuelos?edit=${selected.id}`)} className="px-4 py-2 rounded-md bg-[#003b5e] text-white">Editar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
