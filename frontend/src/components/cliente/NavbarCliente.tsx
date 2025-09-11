import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // 👈 limpia el token
    navigate("/");                // 👈 redirige a Home
  };

  return (
    <nav className="bg-gradient-to-r from-[#005f7f] to-[#003b5eff] p-4 flex justify-between items-center">
      <div className="flex space-x-10">
        <Link to="/foro" className="text-white hover:underline">Foro</Link>
        <Link to="/noticias" className="text-white hover:underline">Noticias</Link>
        <Link to="/perfil" className="text-white hover:underline">Perfil</Link>
        <Link to="/historial" className="text-white hover:underline">Historial</Link>
        <Link to="/checkin" className="text-white hover:underline">Check in</Link>

        {/* Botón de cerrar sesión */}
        <button 
          onClick={handleLogout} 
          className="text-white hover:underline"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Logo a la derecha */}
      <div className="ml-auto flex space-x-10 items-center">
        <img src="/images/letralogosin.png" alt="Letra" className="h-10 w-auto"/>
        <img src="/images/1.png" alt="Logo" className="h-10 w-auto"/>
      </div>
    </nav>
  );
};

export default Navbar;
