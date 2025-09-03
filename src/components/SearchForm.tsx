
import React, { useState } from 'react';

const SearchForm: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ origin, destination, date });
    // Aquí luego conectaremos con backend
  };

  return (
  <form onSubmit={handleSubmit} 
        style={{margin: '2rem 0',  
                display: 'flex', 
                alignItems: 'center',   
                gap: '0.5rem', 
                flexWrap: 'wrap' }}>
    <input type="text" placeholder="Origen" value={origin} onChange={e => setOrigin(e.target.value)} />
    <input type="text" placeholder="Destino" value={destination} onChange={e => setDestination(e.target.value)} />
    <input type="date" value={date} onChange={e => setDate(e.target.value)} />
    <button type="submit" style={{ marginTop: '1rem' }}>Buscar</button>
  </form>
  );
};

export default SearchForm;
