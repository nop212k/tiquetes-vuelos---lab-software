// src/pages/Home.tsx
import React from 'react';
import Navbar from '../components/Navbar';
import SearchForm from '../components/SearchForm';
import Footer from '../components/Footer';
import './Home.css'; // Archivo CSS para los estilos de Home

const Home: React.FC = () => {
  return (
    <div>
      <Navbar />
      <main className="home-main">
        <div className="form-container">
          <h2>Busca tus vuelos</h2>      {/* texto encima del formulario */}
          <SearchForm />                  {/* formulario */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
