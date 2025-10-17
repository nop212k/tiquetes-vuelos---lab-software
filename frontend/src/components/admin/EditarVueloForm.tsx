import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../admin/NavbarAdmin";
import moment from "moment-timezone";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const ciudadesOrigen = ["Pereira", "Bogotá", "Medellín", "Cali", "Cartagena"] as const;
const ciudadesDestino = [
  "Pereira", "Bogotá", "Medellín", "Cali", "Cartagena",
  "Madrid", "Londres", "New York", "Buenos Aires", "Miami"
] as const;

const distancias: Record<string, number> = {
  Madrid: 8000,
  Londres: 8500,
  "New York": 4000,
  "Buenos Aires": 4600,
  Miami: 2400,
};

const zonasHorarias: Record<string, string> = {
  Madrid: "Europe/Madrid",
  Londres: "Europe/London",
  "New York": "America/New_York",
  "Buenos Aires": "America/Argentina/Buenos_Aires",
  Miami: "America/New_York",
};

const destinosInternacionales = new Set(["Madrid", "Londres", "New York", "Buenos Aires", "Miami"]);

function calcularLlegadaYDuracion(origen: string, destino: string, horaSalidaISO: string) {
  const salidaLocal = moment.tz(horaSalidaISO, "YYYY-MM-DDTHH:mm", "America/Bogota");
  if (!salidaLocal.isValid()) return null;

  const distancia = distancias[destino] ?? 300;
  let duracionHoras = distancia / 900;
  if (origen !== "Bogotá") duracionHoras += 0.2;
  const duracionMinutos = Math.max(1, Math.round(duracionHoras * 60));

  const llegadaUTC = salidaLocal.clone().add(duracionMinutos, "minutes").utc();
  const zonaDestino = destinosInternacionales.has(destino) ? (zonasHorarias[destino] ?? "UTC") : "America/Bogota";
  const llegadaLocalDestino = salidaLocal.clone().add(duracionMinutos, "minutes").tz(zonaDestino);

  const llegadaLocalForInput = llegadaLocalDestino.format("YYYY-MM-DDTHH:mm");
  const llegadaUtcIso = llegadaUTC.toISOString();
  const salidaUtcIso = salidaLocal.clone().utc().toISOString();

  return {
    duracionMinutos,
    llegadaLocalForInput,
    llegadaUtcIso,
    salidaUtcIso,
  };
}

const EditarVueloForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vuelo, setVuelo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [horaLlegada, setHoraLlegada] = useState("");
  const [duracionMin, setDuracionMin] = useState<number | null>(null);
  const [costoBase, setCostoBase] = useState<string>("");

  useEffect(() => {
    const fetchVuelo = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/flights/${id}`);
        const vueloData = res.data.vuelo || res.data; // soporta ambos formatos
        if (!vueloData) {
          console.error("No se encontró el vuelo en la respuesta:", res.data);
          alert("Error: no se pudo cargar el vuelo.");
          navigate("/admin");
          return;
        }
        setVuelo(vueloData);
        setOrigen(vueloData.origen);
        setDestino(vueloData.destino);
        setCostoBase(String(vueloData.costoBase || 0));
        setHoraSalida(moment(vueloData.hora).format("YYYY-MM-DDTHH:mm"));
        setHoraLlegada(moment(vueloData.horaLlegada).format("YYYY-MM-DDTHH:mm"));
        setDuracionMin(vueloData.tiempoVuelo ?? null);
      } catch (err) {
        console.error("Error cargando vuelo:", err);
        alert("Error al cargar los datos del vuelo.");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    fetchVuelo();
  }, [id, navigate]);

  useEffect(() => {
    if (!origen || !destino || !horaSalida) return;
    const res = calcularLlegadaYDuracion(origen, destino, horaSalida);
    if (res) {
      setHoraLlegada(res.llegadaLocalForInput);
      setDuracionMin(res.duracionMinutos);
    }
  }, [origen, destino, horaSalida]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vuelo) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión como admin.");
      navigate("/login");
      return;
    }

    const calc = calcularLlegadaYDuracion(origen, destino, horaSalida);
    if (!calc) {
      alert("Error calculando llegada/duración.");
      return;
    }

    const { duracionMinutos, llegadaUtcIso } = calc;
    const payload = {
      origen,
      destino,
      hora: moment(horaSalida).format("YYYY-MM-DDTHH:mm"),
      horaLlegada: llegadaUtcIso,
      tiempoVuelo: duracionMinutos,
      costoBase: Number(costoBase),
      esInternacional: destinosInternacionales.has(destino),
    };

    setGuardando(true);
    try {
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      await axios.put(`${API_BASE}/api/flights/admin/${id}`, payload, { headers });
      alert("✅ Vuelo actualizado correctamente.");
      navigate("/admin");
    } catch (err: any) {
      console.error("Error actualizando vuelo:", err?.response?.data || err.message);
      alert("Error actualizando vuelo. Revisa la consola para más detalles.");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-600">Cargando datos del vuelo...</p>;

  return (
    <div>
      <Navbar />
      <div
        className="min-h-[100vh] flex items-center justify-center px-4 py-10"
        style={{
          backgroundImage: "url('/images/fondoAdmin.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-full max-w-lg bg-[#09374b] rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Editar Vuelo</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de vuelo
                </label>
                <input
                  value={vuelo?.codigoVuelo || ""}
                  readOnly
                  className="w-full p-3 rounded-md border border-gray-200 bg-gray-100 text-gray-700 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                <select
                  value={origen}
                  onChange={(e) => {
                    setOrigen(e.target.value);
                    if (e.target.value === destino) setDestino("");
                  }}
                  className="w-full p-3 rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-[#003b5eff]"
                >
                  <option value="">Seleccione origen</option>
                  {ciudadesOrigen.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                <select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  className="w-full p-3 rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-[#003b5eff]"
                >
                  <option value="">Seleccione destino</option>
                  {ciudadesDestino.filter((c) => c !== origen).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora de salida</label>
                <input
                  type="datetime-local"
                  value={horaSalida}
                  onChange={(e) => setHoraSalida(e.target.value)}
                  className="w-full p-3 rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de llegada (local destino)
                </label>
                <input
                  type="datetime-local"
                  value={horaLlegada}
                  readOnly
                  className="w-full p-3 rounded-md border border-gray-200 bg-gray-100 text-gray-700 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
                  <input
                    value={duracionMin != null ? `${Math.floor(duracionMin / 60)} h ${duracionMin % 60} min` : "-"}
                    readOnly
                    className="w-full p-3 rounded-md border border-gray-200 bg-gray-100 text-gray-700 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo base (COP)</label>
                  <input
                    type="number"
                    min={45000}
                    step={1}
                    value={costoBase}
                    onChange={(e) => setCostoBase(e.target.value)}
                    className="w-full p-3 rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm"
                  />
                </div>
              </div>

              <button
                disabled={guardando}
                type="submit"
                className="w-full py-3 rounded-md text-white font-medium bg-[#003b5eff] hover:bg-[#005f8a]"
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarVueloForm;
