import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../admin/NavbarAdmin";
import * as z from "zod";
import moment from "moment-timezone";
import { useNavigate } from "react-router-dom";


const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";


interface Props {
  onVuelosCreados?: () => void;
}

const ciudadesOrigen = ["Pereira", "Bogotá", "Medellín", "Cali", "Cartagena"] as const;
const ciudadesDestino = ["Madrid", "Londres", "New York", "Buenos Aires", "Miami"] as const;

//Validación con Zod
const vueloSchema = z.object({
  origen: z.enum(ciudadesOrigen),
  destino: z.enum(ciudadesDestino),
  horaSalida: z.string().refine((value) => {
    const salida = new Date(value);
    const ahoraMas3 = new Date();
    ahoraMas3.setHours(ahoraMas3.getHours() + 3);
    return salida >= ahoraMas3;
  }, { message: "La hora de salida debe ser al menos 3 horas después de la actual" }),
});

//Distancias aproximadas en km
const distancias: Record<string, number> = {
  Madrid: 8000,
  Londres: 8500,
  "New York": 4000,
  "Buenos Aires": 4600,
  Miami: 2400,
};

// 📌 Zonas horarias
const zonasHorarias: Record<string, string> = {
  Madrid: "Europe/Madrid",
  Londres: "Europe/London",
  "New York": "America/New_York",
  "Buenos Aires": "America/Argentina/Buenos_Aires",
  Miami: "America/New_York",
};

//Función de cálculo realista
function calcularHoraLlegada(origen: string, destino: string, horaSalida: string) {
  const salida = moment.tz(horaSalida, "America/Bogota"); // siempre desde Colombia

  let duracionVuelo = distancias[destino] / 900; // velocidad estándar 900 km/h
  if (origen !== "Bogotá") {
    duracionVuelo += 1; // conexión interna aprox
  }

  const llegada = salida.clone().add(duracionVuelo, "hours");
  const llegadaDestino = llegada.clone().tz(zonasHorarias[destino]);

  return {
    localDestino: llegadaDestino.format("YYYY-MM-DDTHH:mm"), // para mostrar en input
    utc: llegada.utc().format(), // para guardar en BD
  };
}


const CrearVuelosForm: React.FC<Props> = ({ onVuelosCreados }) => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [horaLlegada, setHoraLlegada] = useState("");

  //Calculamos llegada automáticamente
  useEffect(() => {
    if (origen && destino && horaSalida) {
      const { localDestino } = calcularHoraLlegada(origen, destino, horaSalida);
      setHoraLlegada(localDestino);
      }
    }, [origen, destino, horaSalida]);


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  console.log("Formulario enviado");
  console.log("Datos a enviar:", { origen, destino, horaSalida });

  
  


  // Validación con Zod antes de enviar
  const validacion = vueloSchema.safeParse({ origen, destino, horaSalida });
  if (!validacion.success) {
    console.error("Errores de validación:", validacion.error.errors);
    alert(validacion.error.errors[0].message);
    return;
  }

  try {
    // Calculamos llegada y duración
    const { utc } = calcularHoraLlegada(origen, destino, horaSalida);

    
    // Duración aproximada en horas
    const duracionVuelo = Math.round(moment(utc).diff(moment(horaSalida), "hours", true));
    const token = localStorage.getItem("token"); 
    // Enviar al backend
    await axios.post(`${API_BASE}/api/flights/`, {
        origen,
        destino,
        tiempoVuelo: duracionVuelo,
        esInternacional: true,
        hora: moment(horaSalida).format("YYYY-MM-DD HH:mm:ss"),
        horaLocalDestino: moment(horaLlegada).format("YYYY-MM-DD HH:mm:ss"),
        costoBase: 1000
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });





// Limpiar formulario
setOrigen("");
setDestino("");
setHoraSalida("");
setHoraLlegada("");
setCodigo("");
    
onVuelosCreados?.(); // avisar al padre si es necesario
} catch (err: any) {
  if (err.response) {
    console.error("❌ Error del backend:", err.response.status, err.response.data);
    alert(`Error del backend: ${err.response.data.message || "Revisa la consola"}`);
  } else if (err.request) {
    console.error("❌ No hubo respuesta del backend:", err.request);
    alert("No hubo respuesta del backend. Revisa la consola y tu API.");
  } else {
    console.error("❌ Error enviando la request:", err.message);
    alert("Error enviando la request. Revisa la consola.");
  }
}


navigate("/admin");


};


  return (
    <div>
      <Navbar />
      {/* Fondo */}
      <div
        className="min-h-[100vh] flex items-center justify-center px-4"
        style={{
          backgroundImage: "url('/images/fondoAdmin.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Formulario */}
        <div className="w-full max-w-lg bg-[#09374b] rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Crear Vuelo</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Código */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código de vuelo</label>
                <input value={codigo} readOnly className="w-full p-3 rounded-md border border-gray-200 bg-gray-100 text-gray-700 shadow-sm" />
              </div>

              {/* Origen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                <select
                  value={origen}
                  onChange={(e) => {
                    setOrigen(e.target.value);
                    setDestino("");
                  }}
                  className="w-full p-3 rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-[#003b5eff]"
                >
                  <option value="">Seleccione origen</option>
                  {ciudadesOrigen.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destino */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                <select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  className="w-full p-3 rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-[#003b5eff]"
                >
                  <option value="">Seleccione destino</option>
                  {ciudadesDestino.filter((c) => c !== origen).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

                            {/* Hora salida */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora de salida</label>
                <input type="datetime-local" value={horaSalida}
                  min={moment().add(3, "hours").format("YYYY-MM-DDTHH:mm")}
                  max={moment().add(6, "months").format("YYYY-MM-DDTHH:mm")}
                  onChange={(e) => {
                    const seleccionada = moment(e.target.value);
                    const minPermitido = moment().add(3, "hours");
                    const maxPermitido = moment().add(6, "months");

                    if (seleccionada.isBefore(minPermitido)) {
                      alert("⚠️ La salida debe ser al menos 3 horas después de la hora actual");
                      return;
                    }
                    if (seleccionada.isAfter(maxPermitido)) {
                      alert("⚠️ La salida no puede ser más de 6 meses después");
                      return;
                    }

                    setHoraSalida(e.target.value);
                  }}
                  className="w-full p-3 rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-[#003b5eff]"
                />
              </div>


              {/* Hora llegada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora de llegada (Ciudad destino)</label>
                <input
                  type="datetime-local"
                  value={horaLlegada}
                  readOnly
                  className="w-full p-3 rounded-md border border-gray-200 bg-gray-100 text-gray-700 shadow-sm"
                />
              </div>

              {/* Botón */}
              <button type="submit" className="w-full py-3 rounded-md text-white font-medium bg-[#003b5eff] hover:bg-[#005f8a]">
                Crear vuelo
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearVuelosForm;
