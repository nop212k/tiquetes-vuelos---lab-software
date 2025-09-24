import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Simulación del nombre del usuario
  const userName = localStorage.getItem("userName") || "Usuario";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleAdmin = () => {
    console.log("Panel admin clickeado");
  };

  const handleCrearVuelos = () => {
    console.log("Crear vuelos clickeado");
  };

  const handlePerfil = () => {
    console.log("Perfil clickeado");
  };

  return (
    <nav className="bg-gradient-to-r from-[#005f7f] to-[#003b5eff] p-4 flex justify-between items-center shadow-md">
      {/* Botones lado izquierdo */}
      <div className="flex space-x-8 items-center">
        {/* Botón destacado con degradado */}
        <button
          onClick={handleAdmin}
          className="bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white font-semibold px-6 py-2 rounded-lg 
                     shadow-sm hover:shadow-md hover:border-[#f97316] border border-transparent transition"
        >
          Panel admin
        </button>

        <button
          onClick={handleCrearVuelos}
          className="text-white font-medium hover:underline"
        >
          Crear vuelos
        </button>

        <button
          onClick={handlePerfil}
          className="text-white font-medium hover:underline"
        >
          Perfil
        </button>

        <button
          onClick={handleLogout}
          className="text-white font-medium hover:underline"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Lado derecho: usuario + logo */}
      <div className="ml-auto flex items-center space-x-6">
        <div
          className="flex items-center space-x-2 bg-gradient-to-r from-[#004a66] to-[#00384d] 
                     px-4 py-1 rounded-full shadow-sm border border-transparent
                     hover:border-[#f97316] transition"
        >
          <span className="bg-[#0ea5e9] text-white font-bold w-6 h-6 flex items-center justify-center rounded-full">
            {userInitial}
          </span>
          <span className="text-white font-medium">{userName}</span>
        </div>
        <img
          src="/images/letralogosin.png"
          alt="Letra"
          className="h-10 w-auto"
        />
        <img
          src="/images/1.png"
          alt="Logo"
          className="h-10 w-auto"
        />
      </div>
    </nav>
  );
};

export default Navbar;
