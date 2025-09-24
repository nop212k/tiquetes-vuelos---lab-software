// frontend/src/components/CrearVuelosForm.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

interface Props {
  onVuelosCreados: () => void;
}

const ciudadesOrigen = ["Pereira", "Bogotá", "Medellín", "Cali", "Cartagena"];
const ciudadesDestino = ["Pereira", "Bogotá", "Medellín", "Cali", "Cartagena", "Madrid", "Londres", "New York", "Buenos Aires", "Miami"];

const generarCodigoVuelo = (): string => {
  const num = Math.floor(100 + Math.random() * 900); // 3 dígitos aleatorios
  return `AV${num}`;
};

const CrearVuelosForm: React.FC<Props> = ({ onVuelosCreados }) => {
  const [codigo, setCodigo] = useState(generarCodigoVuelo());
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [horaLlegada, setHoraLlegada] = useState("");

  // Actualizar hora de llegada automáticamente
  useEffect(() => {
    if (origen && destino && horaSalida) {
      // Para simplicidad, definimos tiempos de vuelo aproximados en horas
      const tiempos: Record<string, Record<string, number>> = {
        Pereira: { Bogotá: 1, Medellín: 1.2, Cali: 1.1, Cartagena: 1.5, Madrid: 10, Londres: 10, "New York": 7, "Buenos Aires": 10, Miami: 7 },
        Bogotá: { Pereira: 1, Medellín: 1, Cali: 1.1, Cartagena: 1.5, Madrid: 10, Londres: 10, "New York": 7, "Buenos Aires": 10, Miami: 7 },
        Medellín: { Pereira: 1.2, Bogotá: 1, Cali: 1.3, Cartagena: 1.4, Madrid: 10, Londres: 10, "New York": 7, "Buenos Aires": 10, Miami: 7 },
        Cali: { Pereira: 1.1, Bogotá: 1.1, Medellín: 1.3, Cartagena: 1.5, Madrid: 10, Londres: 10, "New York": 7, "Buenos Aires": 10, Miami: 7 },
        Cartagena: { Pereira: 1.5, Bogotá: 1.5, Medellín: 1.4, Cali: 1.5, Madrid: 10, Londres: 10, "New York": 7, "Buenos Aires": 10, Miami: 7 },
      };

      const salida = new Date(horaSalida);
      const tiempoVuelo = tiempos[origen][destino] || 2; // Default 2 horas
      salida.setHours(salida.getHours() + tiempoVuelo);
      setHoraLlegada(salida.toISOString().slice(0, 16)); // YYYY-MM-DDTHH:MM
    }
  }, [origen, destino, horaSalida]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/flights/admin`, { codigo, origen, destino, horaSalida, horaLlegada });
      onVuelosCreados();
      setCodigo(generarCodigoVuelo());
      setOrigen("");
      setDestino("");
      setHoraSalida("");
      setHoraLlegada("");
    } catch (err) {
      console.error("Error creando vuelo", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded bg-white shadow">
      <div className="mb-2">
        <label className="block font-bold">Código de vuelo:</label>
        <input value={codigo} readOnly className="border p-1 w-full" />
      </div>

      <div className="mb-2">
        <label className="block font-bold">Origen:</label>
        <select value={origen} onChange={(e) => { setOrigen(e.target.value); setDestino(""); }} className="border p-1 w-full">
          <option value="">Seleccione origen</option>
          {ciudadesOrigen.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="mb-2">
        <label className="block font-bold">Destino:</label>
        <select value={destino} onChange={(e) => setDestino(e.target.value)} className="border p-1 w-full">
          <option value="">Seleccione destino</option>
          {ciudadesDestino.filter(c => c !== origen).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="mb-2">
        <label className="block font-bold">Hora de salida:</label>
        <input type="datetime-local" value={horaSalida} onChange={(e) => setHoraSalida(e.target.value)} className="border p-1 w-full" />
      </div>

      <div className="mb-2">
        <label className="block font-bold">Hora de llegada:</label>
        <input type="datetime-local" value={horaLlegada} readOnly className="border p-1 w-full" />
      </div>

      <button type="submit" className="bg-blue-500 text-white p-2 rounded">Crear vuelo</button>
    </form>
  );
};

export default CrearVuelosForm;
