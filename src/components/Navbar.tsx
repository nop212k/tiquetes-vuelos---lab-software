// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav style={{ 
      width: '100%',
      height: '70px',
      padding: '1rem',
      backgroundColor: '#003b5eff',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxSizing: 'border-box'
    }}>
      
      {/* Contenedor de imágenes en lugar de texto */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/images/1.png" alt="Logo 1" style={{ height: '70px' }} />
        <img src="/images/letralogo.jpg" alt="Logo 2" style={{ height: '100px', width: '200px', objectFit: 'contain' }}/>
      </div>

      {/* Botones a la derecha */}
      <div>
        <Link to="/login">
          <button style={{ marginRight: '10px' }}>Ingresar</button>
        </Link>
        <Link to="/registro">
          <button>Registro</button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
