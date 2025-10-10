import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // 👈 limpia el token
    navigate("/");                // 👈 redirige a Home
  };

  const handleCAdmind = () => {
    localStorage.removeItem("token"); // 👈 limpia el token
    navigate("/registro-admin"); // 👈 redirige a Home
  };

  return (
    <nav className="bg-gradient-to-r from-[#005f7f] to-[#003b5eff] p-4 flex justify-between items-center">
      <div className="flex space-x-10">
         <Link to="/foroAdmin" className="text-white hover:underline cursor-pointer">Foro</Link>
        <button onClick={handleCAdmind}
            className="bg-transparent border-none text-white hover:underline cursor-pointer appearance-none p-0">
          Registrar Administrador</button>      
          {/* Botón de cerrar sesión */}
          <button onClick={handleLogout}
            className="bg-transparent border-none text-white hover:underline cursor-pointer appearance-none p-0">
          Cerrar sesión</button>
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
