import React, { useState } from "react";


const API_URL = "http://localhost:8000/api";

// Ciudades nacionales e internacionales
const nationalCities = [
  "Leticia","Medellín","Arauca","Barranquilla","Bogotá","Cartagena","Tunja","Manizales","Florencia",
  "Yopal","Popayán","Valledupar","Quibdó","Montería","Bogotá D.C.","Inírida","San José del Guaviare",
  "Neiva","Riohacha","Santa Marta","Villavicencio","Pasto","Cúcuta","Mocoa","Armenia","Pereira",
  "San Andrés","Bucaramanga","Sincelejo","Ibagué","Cali","Mitú","Puerto Carreño"];


const internationalOrigins = ["Bogotá", "Medellín", "Cali", "Pereira", "Cartagena"];
const internationalDestinations = ["Madrid","Miami","Londres","New York","Buenos Aires"];

// Función para buscar vuelos desde el backend
async function searchFlights(filters: any) {
  const response = await fetch(`${API_URL}/flights/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  if (!response.ok) throw new Error("Error al buscar vuelos");
  return response.json();
}

export default function FlightSearch() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [flightType, setFlightType] = useState("nacional"); // nacional o internacional
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Manejo de cambios
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

      // --- FILTRO COMPLETO ---
      flights = flights.filter((f: any) => {
        const fOrigin = f.origen?.toLowerCase();
        const fDest = f.destino?.toLowerCase();
        const originLower = origin.toLowerCase();
        const destLower = destination.toLowerCase();

        const matchesOrigin = !origin || fOrigin.includes(originLower);
        const matchesDest = !destination || fDest.includes(destLower);
        const matchesDate = !date || f.fecha === date;  

        const isNational =
          nationalCities.some((c) => c.toLowerCase() === fOrigin) &&
          nationalCities.some((c) => c.toLowerCase() === fDest);

        const isInternational =
          internationalOrigins.some((c) => c.toLowerCase() === fOrigin) &&
          internationalDestinations.some((c) => c.toLowerCase() === fDest);

        return (
          matchesOrigin &&
          matchesDest &&
          matchesDate &&
          ((flightType === "nacional" && isNational) ||
            (flightType === "internacional" && isInternational))
        );
      });

      setResults(flights);

      if (flights.length === 0) {
        setError(`No se encontraron vuelos ${flightType}s disponibles.`);
      }

      document.querySelector(".results-section")?.scrollIntoView({ behavior: "smooth" });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error buscando vuelos");
    } finally {
      setLoading(false);
    }
  };

  // Ciudades mostradas según el tipo de vuelo
  const originOptions =
    flightType === "nacional" ? nationalCities : internationalOrigins;
  const destinationOptions =
    flightType === "nacional" ? nationalCities : internationalDestinations;

  console.log("Resultados de vuelos (para depurar):", results);


  return (
    <div className="w-full">
      {/* --- FORMULARIO --- */}
      <section className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Buscar vuelos {flightType === "nacional" ? "nacionales" : "internacionales"}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de vuelo
            </label>
            <select
              value={flightType}
              onChange={handleFlightTypeChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="nacional">Nacional</option>
              <option value="internacional">Internacional</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Origen
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
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
            <label className="block text-sm font-medium text-gray-700">
              Destino
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
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
            <label className="block text-sm font-medium text-gray-700">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div className="md:col-span-2 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? "Buscando..." : "Buscar vuelos"}
            </button>
          </div>
        </form>

        {error && (
          <p className="text-center text-red-600 mt-4 font-medium">{error}</p>
        )}
      </section>

      {/* --- RESULTADOS --- */}
      <section className="results-section max-w-5xl mx-auto mt-10 p-4">
        {results.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4 text-center">
              Resultados de vuelos
            </h2>
            <div className="grid gap-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 rounded-lg">
              {results.map((flight, index) => (
                <div
                  key={index}
                  className="bg-white shadow-lg rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
                >
                  {/* --- Información del vuelo --- */}
                  <div className="text-gray-700 font-medium space-y-2">
                    <p className="text-xl font-semibold text-gray-800">
                      ✈️ {flight.origen} → {flight.destino}
                    </p>
                    <p>
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
                    <p>
                      🧾 <span className="font-semibold">Código:</span> {flight.codigoVuelo}
                    </p>
                  </div>

                  {/* --- Precio y botones --- */}
                  <div className="flex flex-col items-end mt-4 md:mt-0 space-y-3">
                    <p className="text-blue-600 text-2xl font-bold">
                      ${Number(flight.costoBase).toLocaleString("es-CO", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => alert(`Reserva creada para el vuelo ${flight.codigoVuelo}`)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                      >
                        Reservar
                      </button>
                      <button
                        onClick={() => alert(`Compra realizada para el vuelo ${flight.codigoVuelo}`)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Comprar
                      </button>
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
