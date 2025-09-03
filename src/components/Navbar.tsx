import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav style={{ width: '100%',
                  height: '70px',              
                  padding: '1rem', 
                  backgroundColor: '#003b5eff',
                  color: 'white', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxSizing: 'border-box' }}>
      <h1>Pearl Airlines</h1>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button>Login</button>
        <button>Registro</button>
      </div>
    </nav>
  );
};

export default Navbar;
