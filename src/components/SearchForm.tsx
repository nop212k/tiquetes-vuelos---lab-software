import React, { useState } from 'react';

// Ciudades de origen
const originCities = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Cartagena",
  "Pereira"
];

// Ciudades de destino (origen + internacionales)
const destinationCities = [
  ...originCities,
  "Madrid",
  "Londres",
  "New York",
  "Buenos Aires",
  "Miami"
];

const SearchForm: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const twoYearsLater = new Date();
  twoYearsLater.setFullYear(today.getFullYear() + 2);
  const maxDate = twoYearsLater.toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ origin, destination, date });
  };

  return (
    <form 
      onSubmit={handleSubmit}
      style={{
        margin: "2rem auto",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        flexWrap: "wrap",
        justifyContent: "center"
      }}
    >

      {/* Origen */}
      <select
        value={origin}
        onChange={e => setOrigin(e.target.value)}
        style={{
          padding: "0.8rem 1rem",
          fontSize: "1rem",
          borderRadius: "10px",
          border: "1px solid #ccc",
          minWidth: "180px",
          backgroundColor: "#ffffff",
          color: "#000000"
        }}
      >
        <option value="">Selecciona origen</option>
        {originCities
          .filter(city => city !== destination)
          .map(city => (
            <option key={city} value={city}>{city}</option>
        ))}
      </select>

      {/* Destino */}
      <select
        value={destination}
        onChange={e => setDestination(e.target.value)}
        style={{
          padding: "0.8rem 1rem",
          fontSize: "1rem",
          borderRadius: "10px",
          border: "1px solid #ccc",
          minWidth: "180px",
          backgroundColor: "#ffffff",
          color: "#000000"
        }}
      >
        <option value="">Selecciona destino</option>
        {destinationCities
          .filter(city => city !== origin)
          .map(city => (
            <option key={city} value={city}>{city}</option>
        ))}
      </select>

      {/* Fecha */}
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        min={minDate}
        max={maxDate}
        style={{
          padding: "0.8rem 1rem",
          fontSize: "1rem",
          borderRadius: "10px",
          border: "1px solid #ccc",
          backgroundColor: "#ffffff",
          color: "#000000"
        }}
      />

      {/* Botón */}
      <button
        type="submit"
        style={{
          padding: "0.8rem 1.5rem",
          fontSize: "1rem",
          borderRadius: "10px",
          border: "none",
          backgroundColor: "#003b5e",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer"
        }}
        onMouseOver={e => (e.currentTarget.style.backgroundColor = '#005f8a')}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = '#003b5e')}
      >
        Buscar
      </button>
    </form>
  );
};

export default SearchForm;
