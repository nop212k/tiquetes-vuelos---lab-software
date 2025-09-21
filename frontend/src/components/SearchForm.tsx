// frontend/src/pages/SearchForm.tsx
import React, { useState } from 'react';
import { searchFlights } from '../services/api';

// Ciudades (puedes reemplazar por dataset real)
const originCities = ["Bogotá","Medellín","Cali","Cartagena","Pereira"];
const destinationCities = [...originCities, "Madrid","Londres","New York","Buenos Aires","Miami"];

const SearchForm: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];
  const twoYearsLater = new Date();
  twoYearsLater.setFullYear(today.getFullYear() + 2);
  const maxDate = twoYearsLater.toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await searchFlights({ origin, destination, date });
      setResults(data.results || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error buscando vuelos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ margin: "2rem auto", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <select value={origin} onChange={e => setOrigin(e.target.value)} style={{ padding: "0.8rem 1rem", fontSize: "1rem", borderRadius: "10px", border: "1px solid #ccc", minWidth: "180px", backgroundColor: "#ffffff", color: "#000000" }}>
          <option value="">Selecciona origen</option>
          {originCities.filter(city => city !== destination).map(city => <option key={city} value={city}>{city}</option>)}
        </select>

        <select value={destination} onChange={e => setDestination(e.target.value)} style={{ padding: "0.8rem 1rem", fontSize: "1rem", borderRadius: "10px", border: "1px solid #ccc", minWidth: "180px", backgroundColor: "#ffffff", color: "#000000" }}>
          <option value="">Selecciona destino</option>
          {destinationCities.filter(city => city !== origin).map(city => <option key={city} value={city}>{city}</option>)}
        </select>

        <input type="date" value={date} onChange={e => setDate(e.target.value)} min={minDate} max={maxDate} style={{ padding: "0.8rem 1rem", fontSize: "1rem", borderRadius: "10px", border: "1px solid #ccc", backgroundColor: "#ffffff", color: "#000000" }} />

        <button type="submit" style={{ padding: "0.8rem 1.5rem", fontSize: "1rem", borderRadius: "10px", border: "none", backgroundColor: "#003b5e", color: "white", fontWeight: "bold", cursor: "pointer" }}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && <div style={{ color: "red", textAlign: "center" }}>{error}</div>}

      <div style={{ maxWidth: 980, margin: "1rem auto", padding: "1rem" }}>
        {results.length === 0 && !loading && <div style={{ textAlign: "center", color: "#666" }}>No hay resultados</div>}
        {results.map((r: any) => (
          <div key={r.id} style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{r.origen} → {r.destino} • {r.codigoVuelo}</div>
              <div style={{ fontSize: 13, color: "#555" }}>{r.fecha} • {r.hora} • Duración: {r.tiempoVuelo} min</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>${r.costoBase}</div>
              <div style={{ fontSize: 12, color: "#777" }}>{r.estado}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchForm;
  