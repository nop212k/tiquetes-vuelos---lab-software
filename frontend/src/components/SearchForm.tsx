import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

// Ciudades nacionales e internacionales
const nationalCities = [
  "Leticia","Medellín","Arauca","Barranquilla","Bogotá","Cartagena","Tunja","Manizales","Florencia",
  "Yopal","Popayán","Valledupar","Quibdó","Montería","Bogotá D.C.","Inírida","San José del Guaviare",
  "Neiva","Riohacha","Santa Marta","Villavicencio","Pasto","Cúcuta","Mocoa","Armenia","Pereira",
  "San Andrés","Bucaramanga","Sincelejo","Ibagué","Cali","Mitú","Puerto Carreño"
];

const internationalOrigins = ["Bogotá", "Medellín", "Cali", "Pereira", "Cartagena"];
const internationalDestinations = ["Madrid","Miami","Londres","New York","Buenos Aires"];

// Función para buscar vuelos desde el backend
async function searchFlights(filters: any) {
  console.log("🔍 Enviando búsqueda con filtros:", filters);
  
  const response = await fetch(`${API_URL}/flights/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  
  console.log("📡 Respuesta status:", response.status);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("❌ Error en respuesta:", errorData);
    throw new Error(errorData.message || "Error al buscar vuelos");
  }
  
  const data = await response.json();
  console.log("✅ Datos recibidos:", data);
  return data;
}

export default function FlightSearch() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [flightType, setFlightType] = useState("nacional");
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFlightTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFlightType(e.target.value);
    setOrigin("");
    setDestination("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Evitar búsquedas vacías
    if (!origin && !destination && !date) {
      setError("Por favor, ingresa al menos un campo para buscar.");
      setLoading(false);
      return;
    }

    // Crear filtros dinámicos (solo los campos llenos)
    const filters: any = {};
    if (origin) filters.origin = origin;
    if (destination) filters.destination = destination;
    if (date) filters.date = date;

    try {
      const data = await searchFlights(filters);
      let flights = data.results || data || [];

      console.log(`📦 Total de vuelos recibidos: ${flights.length}`);

      // Filtrar según tipo de vuelo
      flights = flights.filter((f: any) => {
        const fOrigin = f.origen?.toLowerCase() || "";
        const fDest = f.destino?.toLowerCase() || "";

        const isNational =
          nationalCities.some((c) => c.toLowerCase() === fOrigin) &&
          nationalCities.some((c) => c.toLowerCase() === fDest);

        const isInternational =
          internationalOrigins.some((c) => c.toLowerCase() === fOrigin) &&
          internationalDestinations.some((c) => c.toLowerCase() === fDest);

        return (flightType === "nacional" && isNational) ||
               (flightType === "internacional" && isInternational);
      });

      console.log(`✈️ Vuelos después de filtrar por tipo: ${flights.length}`);

      setResults(flights);

      if (flights.length === 0) {
        setError(`No se encontraron vuelos ${flightType}s disponibles con esos criterios.`);
      } else {
        // Scroll suave a resultados
        setTimeout(() => {
          document.querySelector(".results-section")?.scrollIntoView({ 
            behavior: "smooth",
            block: "start" 
          });
        }, 100);
      }
    } catch (err: any) {
      console.error("❌ Error en búsqueda:", err);
      setError(err.message || "Error buscando vuelos. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Ciudades mostradas según el tipo de vuelo
  const originOptions =
    flightType === "nacional" ? nationalCities : internationalOrigins;
  const destinationOptions =
    flightType === "nacional" ? nationalCities : internationalDestinations;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10">
      {/* --- FORMULARIO --- */}
      <section className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          🔍 Buscar Vuelos {flightType === "nacional" ? "Nacionales" : "Internacionales"}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de vuelo
            </label>
            <select
              value={flightType}
              onChange={handleFlightTypeChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="nacional">✈️ Nacional</option>
              <option value="internacional">🌍 Internacional</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Origen
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccione origen</option>
              {originOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destino
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccione destino</option>
              {destinationOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de salida
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none font-semibold shadow-lg"
            >
              {loading ? "🔄 Buscando..." : "🔍 Buscar vuelos"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            <p className="font-medium">⚠️ {error}</p>
          </div>
        )}
      </section>

      {/* --- RESULTADOS --- */}
      <section className="results-section max-w-5xl mx-auto mt-10 px-4">
        {results.length > 0 && (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                ✅ Resultados de búsqueda
              </h2>
              <p className="text-gray-600 mt-2">
                Se encontraron <span className="font-bold text-blue-600">{results.length}</span> vuelos disponibles
              </p>
            </div>

            <div className="grid gap-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200 rounded-lg">
              {results.map((flight, index) => (
                <div
                  key={flight.id || index}
                  className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-blue-500 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* --- Información del vuelo --- */}
                    <div className="text-gray-700 space-y-2 flex-grow">
                      <p className="text-2xl font-bold text-gray-800">
                        ✈️ {flight.origen} → {flight.destino}
                      </p>
                      <p className="text-gray-600">
                        🕓 <span className="font-semibold">Salida:</span>{" "}
                        {new Date(flight.hora).toLocaleString("es-CO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: "America/Bogota",
                        })}
                      </p>
                      <p className="text-gray-600">
                        🧾 <span className="font-semibold">Código:</span>{" "}
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {flight.codigoVuelo}
                        </span>
                      </p>
                      {flight.esInternacional && (
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                          🌍 Internacional
                        </span>
                      )}
                    </div>

                    {/* --- Precio y botones --- */}
                    <div className="flex flex-col items-end space-y-3 min-w-[200px]">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Desde</p>
                        <p className="text-3xl font-bold text-blue-600">
                          ${Number(flight.costoBase).toLocaleString("es-CO")}
                        </p>
                        <p className="text-xs text-gray-400">COP</p>
                      </div>
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => alert(`Reserva creada para el vuelo ${flight.codigoVuelo}`)}
                          className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold"
                        >
                          📌 Reservar
                        </button>
                        <button
                          onClick={() => alert(`Compra realizada para el vuelo ${flight.codigoVuelo}`)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                        >
                          💳 Comprar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}