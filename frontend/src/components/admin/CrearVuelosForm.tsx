// frontend/src/components/admin/CrearVuelosForm.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../admin/NavbarAdmin";
import moment from "moment-timezone";
import { useNavigate } from "react-router-dom";

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
  // horaSalidaISO => "YYYY-MM-DDTHH:mm" (datetime-local)
  const salidaLocal = moment.tz(horaSalidaISO, "YYYY-MM-DDTHH:mm", "America/Bogota");
  if (!salidaLocal.isValid()) return null;

  const distancia = distancias[destino] ?? 300;
  let duracionHoras = distancia / 900;
  if (origen !== "Bogotá") duracionHoras += 0.2;
  const duracionMinutos = Math.max(1, Math.round(duracionHoras * 60)); // al menos 1

  const llegadaUTC = salidaLocal.clone().add(duracionMinutos, "minutes").utc();
  const zonaDestino = destinosInternacionales.has(destino) ? (zonasHorarias[destino] ?? "UTC") : "America/Bogota";
  const llegadaLocalDestino = salidaLocal.clone().add(duracionMinutos, "minutes").tz(zonaDestino);

  const llegadaLocalForInput = llegadaLocalDestino.format("YYYY-MM-DDTHH:mm"); // para mostrar
  const llegadaUtcIso = llegadaUTC.toISOString();
  const salidaUtcIso = salidaLocal.clone().utc().toISOString();

  return {
    duracionMinutos,
    llegadaLocalForInput,
    llegadaUtcIso,
    salidaUtcIso,
  };
}

function decodeJwtPayload(token: string | null) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch (err) {
    return null;
  }
}

const CrearVuelosForm: React.FC<{ onVuelosCreados?: () => void }> = ({ onVuelosCreados }) => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [horaSalida, setHoraSalida] = useState("");      // datetime-local: YYYY-MM-DDTHH:mm
  const [horaLlegada, setHoraLlegada] = useState("");    // computed datetime-local
  const [duracionMin, setDuracionMin] = useState<number | null>(null);
  const [costoBase, setCostoBase] = useState<string>("100000");
  const [loading, setLoading] = useState(false);

  function generarCodigo() {
    const now = Date.now().toString().slice(-5);
    return `AV${now}`;
  }

  useEffect(() => {
    setCodigo(generarCodigo());
  }, []);

  useEffect(() => {
    if (!origen || !destino || !horaSalida) {
      setHoraLlegada("");
      setDuracionMin(null);
      return;
    }
    const res = calcularLlegadaYDuracion(origen, destino, horaSalida);
    if (res) {
      setHoraLlegada(res.llegadaLocalForInput);
      setDuracionMin(res.duracionMinutos);
    } else {
      setHoraLlegada("");
      setDuracionMin(null);
    }
  }, [origen, destino, horaSalida]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validación básica cliente
    if (!origen || !destino) { alert("Selecciona origen y destino."); return; }
    if (!horaSalida) { alert("Selecciona fecha y hora de salida."); return; }
    if (duracionMin == null || duracionMin < 1) { alert("No se pudo calcular correctamente la duración."); return; }

    const token = localStorage.getItem("token");
    if (!token) { alert("Debes iniciar sesión como admin."); navigate("/login"); return; }

    const jwtPayload = decodeJwtPayload(token);
    const roleFromToken = jwtPayload?.role ?? jwtPayload?.tipo ?? jwtPayload?.tipoUsuario ?? null;
    if (!roleFromToken || String(roleFromToken).toLowerCase() !== "admin") {
      alert("Tu token no tiene rol 'admin'. Inicia sesión con una cuenta admin.");
      return;
    }

    // recalcula por seguridad
    const calc = calcularLlegadaYDuracion(origen, destino, horaSalida);
    if (!calc) { alert("Error calculando llegada/duración."); return; }

    const { duracionMinutos, llegadaUtcIso } = calc;

    // Nota: el backend espera 'hora' con formato "YYYY-MM-DDTHH:mm" (min length 16)
    const horaFormatoSchema = moment(horaSalida).format("YYYY-MM-DDTHH:mm");

    // horaLlegada (según schema: "timestamp completo en UTC")
    const horaLlegadaUTC = llegadaUtcIso; // ya es ISO UTC

    // Validación de precio
    const precioNum= Number(costoBase);

    if (!Number.isInteger((precioNum))) {
    alert("El precio debe ser un número entero (sin decimales).");
      return;
    }

    if (isNaN(precioNum) || precioNum < 45000) {
    alert("El precio mínimo permitido es 45,000 COP.");
      return;
    }


    const payload = {
      codigoVuelo: codigo.trim() || generarCodigo(),
      // campos EXACTOS que pide createFlightSchema
      hora: horaFormatoSchema,               // e.g. "2025-09-27T14:30" (16 chars)
      origen,
      destino,
      tiempoVuelo: Number(duracionMinutos),  // minutos, entero >=1
      esInternacional: destinosInternacionales.has(destino),
      horaLlegada: horaLlegadaUTC,           // ISO UTC (string)
      costoBase: precioNum,
      estado: "programado"
    };

    console.log("Payload a enviar a /api/flights/admin:", payload);
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const res = await axios.post(`${API_BASE}/api/flights/admin`, payload, { headers });
      console.log("Respuesta backend:", res.data);
      alert("✅ Vuelo creado correctamente.");
      setCodigo(generarCodigo());
      setOrigen("");
      setDestino("");
      setHoraSalida("");
      setHoraLlegada("");
      setDuracionMin(null);
      onVuelosCreados?.();
      navigate("/admin");
    } catch (err: any) {
      console.error("Error creando vuelo (admin):", err?.response?.status, err?.response?.data || err.message);
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 403) {
        alert("403 Forbidden: tu usuario no tiene permisos para crear vuelos en /api/flights/admin. Verifica el rol en token y que tu usuario en DB sea 'admin'.");
      } else if (status === 400) {
        if (data?.details) {
          // mostrar detalles de validación para depurar
          alert("400 Bad Request: " + (data.message || "Datos inválidos") + "\n\n" + JSON.stringify(data.details, null, 2));
        } else {
          alert("400 Bad Request: " + JSON.stringify(data));
        }
      } else {
        alert("Error creando vuelo. Revisa consola (Network) para ver payload/respuesta.");
      }
    } finally {
      setLoading(false);
    }
  };

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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Crear Vuelo</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">El código de vuelo sera generado al crear el vuelo</label>
                
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                <select value={origen} onChange={(e) => { setOrigen(e.target.value); if (e.target.value === destino) setDestino(""); }} className="w-full p-3 rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-[#003b5eff]">
                  <option value="">Seleccione origen</option>
                  {ciudadesOrigen.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                <select value={destino} onChange={(e) => setDestino(e.target.value)} className="w-full p-3 rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-[#003b5eff]">
                  <option value="">Seleccione destino</option>
                  {ciudadesDestino.filter((c) => c !== origen).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora de salida</label>
                <input type="datetime-local" value={horaSalida} min={moment().add(3, "hours").format("YYYY-MM-DDTHH:mm")} max={moment().add(6, "months").format("YYYY-MM-DDTHH:mm")} onChange={(e) => setHoraSalida(e.target.value)} className="w-full p-3 rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-[#003b5eff]" />
                <p className="text-xs text-gray-500 mt-1">La salida debe ser al menos 3 horas desde ahora.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora de llegada (local destino)</label>
                <input type="datetime-local" value={horaLlegada} readOnly className="w-full p-3 rounded-md border border-gray-200 bg-gray-100 text-gray-700 shadow-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
                  <input value={duracionMin != null ? `${Math.floor(duracionMin / 60)} h ${duracionMin % 60} min` : "-"} readOnly className="w-full p-3 rounded-md border border-gray-200 bg-gray-100 text-gray-700 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo base (COP)</label>
                  <input type="number" min={45000} step={1} value={costoBase} onChange={(e) => setCostoBase(e.target.value)} className="w-full p-3 rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm" />
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full py-3 rounded-md text-white font-medium bg-[#003b5eff] hover:bg-[#005f8a]">
                {loading ? "Creando..." : "Crear vuelo"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearVuelosForm;
