// frontend/src/components/admin/CrearVuelosForm.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../admin/NavbarAdmin";
import moment from "moment-timezone";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const ciudadesOrigen = ["Pereira", "Bogotá", "Medellín", "Cali", "Cartagena"] as const;
const ciudadesDestino = [
  "Pereira", "Bogotá", "Medellín", "Cali", "Cartagena",
  "Madrid", "Londres", "New York", "Buenos Aires", "Miami"
] as const;

const distancias: Record<string, number> = {
  // Distancias internacionales (km)
  Madrid: 8000,
  Londres: 8500,
  "New York": 4000,
  "Buenos Aires": 4600,
  Miami: 2400,
  // Distancias nacionales aproximadas desde Bogotá (km)
  Pereira: 300,
  Medellín: 350,
  Cali: 450,
  Cartagena: 650,
  Bogotá: 0,
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

  // Calcular distancia entre ciudades
  let distancia = 300; // distancia por defecto
  
  if (origen === destino) {
    // Mismo origen y destino no tiene sentido
    return null;
  }
  
  if (destinosInternacionales.has(destino)) {
    // Vuelo internacional
    distancia = distancias[destino] ?? 4000;
  } else {
    // Vuelo nacional - calcular distancia entre ciudades colombianas
    const distanciaOrigen = distancias[origen] ?? 300;
    const distanciaDestino = distancias[destino] ?? 300;
    distancia = Math.abs(distanciaDestino - distanciaOrigen) + 100; // distancia mínima de 100km
    distancia = Math.max(distancia, 100); // mínimo 100km
  }

  let duracionHoras = distancia / 900;
  if (origen !== "Bogotá" && !destinosInternacionales.has(destino)) duracionHoras += 0.2;
  const duracionMinutos = Math.max(30, Math.round(duracionHoras * 60)); // mínimo 30 minutos

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
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit"); // Detecta ?edit=123

  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingVuelo, setLoadingVuelo] = useState(false);

  const [codigo, setCodigo] = useState("");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [horaLlegada, setHoraLlegada] = useState("");
  const [duracionMin, setDuracionMin] = useState<number | null>(null);
  const [costoBase, setCostoBase] = useState<string>("100000");
  const [loading, setLoading] = useState(false);

  function generarCodigo() {
    const now = Date.now().toString().slice(-5);
    return `AV${now}`;
  }

  // CARGAR VUELO SI ESTAMOS EN MODO EDICIÓN
  useEffect(() => {
    if (editId) {
      setIsEditMode(true);
      cargarVuelo(editId);
    } else {
      setIsEditMode(false);
      setCodigo(generarCodigo());
    }
  }, [editId]);

  const cargarVuelo = async (id: string) => {
    setLoadingVuelo(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/flights/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      
      // Extraer el vuelo (puede estar en res.data directamente o en res.data.vuelo)
      const vuelo = res.data.vuelo || res.data;
      console.log("🔍 DATOS COMPLETOS DEL BACKEND:", JSON.stringify(vuelo, null, 2));

      // Pre-llenar el formulario
      const codigoVuelo = vuelo.codigoVuelo || vuelo.codigo || "";
      console.log("📝 Código:", codigoVuelo);
      setCodigo(codigoVuelo);

      const origenVuelo = vuelo.origen || "";
      console.log("📝 Origen:", origenVuelo);
      setOrigen(origenVuelo);

      const destinoVuelo = vuelo.destino || "";
      console.log("📝 Destino:", destinoVuelo);
      setDestino(destinoVuelo);
      
      // Convertir horaSalida del backend a formato datetime-local
      let horaSalidaLocal = "";
      console.log("🕐 horaSalida del backend:", vuelo.horaSalida);
      console.log("🕐 fecha del backend:", vuelo.fecha);
      console.log("🕐 hora del backend:", vuelo.hora);

      if (vuelo.horaSalida) {
        horaSalidaLocal = moment(vuelo.horaSalida).tz("America/Bogota").format("YYYY-MM-DDTHH:mm");
      } else if (vuelo.hora) {
        horaSalidaLocal = moment(vuelo.hora).tz("America/Bogota").format("YYYY-MM-DDTHH:mm");
      } else if (vuelo.fecha) {
        horaSalidaLocal = moment(vuelo.fecha).tz("America/Bogota").format("YYYY-MM-DDTHH:mm");
      }
      console.log("📝 Hora salida formateada:", horaSalidaLocal);
      setHoraSalida(horaSalidaLocal);

      // horaLlegada local para mostrar
      if (vuelo.horaLlegada) {
        const zonaDestino = destinosInternacionales.has(vuelo.destino) 
          ? (zonasHorarias[vuelo.destino] ?? "UTC") 
          : "America/Bogota";
        const llegadaLocal = moment(vuelo.horaLlegada).tz(zonaDestino).format("YYYY-MM-DDTHH:mm");
        console.log("📝 Hora llegada formateada:", llegadaLocal);
        setHoraLlegada(llegadaLocal);
      }

      const duracion = vuelo.tiempoVuelo || vuelo.duracion || null;
      console.log("📝 Duración (minutos):", duracion);
      setDuracionMin(duracion);

      const costo = String(vuelo.costoBase || vuelo.precio || "100000");
      console.log("📝 Costo base:", costo);
      setCostoBase(costo);

      console.log("✅ FORMULARIO LLENADO CORRECTAMENTE");

    } catch (err: any) {
      console.error("❌ Error cargando vuelo para editar:", err);
      console.error("Respuesta del servidor:", err?.response?.data);
      alert("Error al cargar el vuelo. Verifica que existe y tienes permisos.");
      navigate("/admin");
    } finally {
      setLoadingVuelo(false);
    }
  };

  // Recalcular llegada cuando cambian origen/destino/salida
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
    }
  }, [origen, destino, horaSalida]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    const calc = calcularLlegadaYDuracion(origen, destino, horaSalida);
    if (!calc) { alert("Error calculando llegada/duración."); return; }

    const { duracionMinutos, llegadaUtcIso } = calc;
    const horaFormatoSchema = moment(horaSalida).format("YYYY-MM-DDTHH:mm");
    const horaLlegadaUTC = llegadaUtcIso;
    const precioNum = Number(costoBase);

    if (!Number.isInteger(precioNum)) {
      alert("El precio debe ser un número entero (sin decimales).");
      return;
    }

    if (isNaN(precioNum) || precioNum < 45000) {
      alert("El precio mínimo permitido es 45,000 COP.");
      return;
    }

    const payload = {
      codigoVuelo: codigo.trim() || generarCodigo(),
      hora: horaFormatoSchema,
      origen,
      destino,
      tiempoVuelo: Number(duracionMinutos),
      esInternacional: destinosInternacionales.has(destino),
      horaLlegada: horaLlegadaUTC,
      costoBase: precioNum,
      estado: "programado"
    };

    console.log(isEditMode ? "Actualizando vuelo:" : "Creando vuelo:", payload);
    setLoading(true);

    try {
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      
      if (isEditMode && editId) {
        // ACTUALIZAR (PUT)
        const res = await axios.put(`${API_BASE}/api/flights/admin/${editId}`, payload, { headers });
        console.log("Respuesta actualización:", res.data);
        alert("✅ Vuelo actualizado correctamente.");
      } else {
        // CREAR (POST)
        const res = await axios.post(`${API_BASE}/api/flights/admin`, payload, { headers });
        console.log("Respuesta creación:", res.data);
        alert("✅ Vuelo creado correctamente.");
      }

      onVuelosCreados?.();
      navigate("/admin");

    } catch (err: any) {
      console.error(isEditMode ? "Error actualizando vuelo:" : "Error creando vuelo:", err?.response?.status, err?.response?.data || err.message);
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 403) {
        alert("403 Forbidden: No tienes permisos para esta acción.");
      } else if (status === 400) {
        alert("400 Bad Request: " + (data?.message || JSON.stringify(data)));
      } else if (status === 404) {
        alert("404 Not Found: El vuelo no existe.");
      } else {
        alert("Error. Revisa la consola del navegador.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    navigate("/admin");
  };

  if (loadingVuelo) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Cargando vuelo...</div>
        </div>
      </div>
    );
  }

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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {isEditMode ? "Editar Vuelo" : "Crear Vuelo"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isEditMode ? "Código del vuelo" : "El código de vuelo será generado al crear el vuelo"}
                </label>
                {isEditMode && (
                  <input 
                    type="text" 
                    value={codigo} 
                    readOnly 
                    className="w-full p-3 rounded-md border border-gray-200 bg-gray-100 text-gray-700"
                  />
                )}
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
                  {ciudadesOrigen.map((c) => <option key={c} value={c}>{c}</option>)}
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
                  {ciudadesDestino.filter((c) => c !== origen).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora de salida</label>
                <input 
                  type="datetime-local" 
                  value={horaSalida} 
                  min={moment().add(3, "hours").format("YYYY-MM-DDTHH:mm")} 
                  max={moment().add(6, "months").format("YYYY-MM-DDTHH:mm")} 
                  onChange={(e) => setHoraSalida(e.target.value)} 
                  className="w-full p-3 rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-[#003b5eff]" 
                />
                <p className="text-xs text-gray-500 mt-1">La salida debe ser al menos 3 horas desde ahora.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora de llegada (local destino)</label>
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

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={handleCancelar}
                  className="flex-1 py-3 rounded-md text-gray-700 font-medium bg-gray-200 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button 
                  disabled={loading} 
                  type="submit" 
                  className="flex-1 py-3 rounded-md text-white font-medium bg-[#003b5eff] hover:bg-[#005f8a] disabled:opacity-50"
                >
                  {loading ? (isEditMode ? "Actualizando..." : "Creando...") : (isEditMode ? "Actualizar vuelo" : "Crear vuelo")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearVuelosForm;