import React, { useEffect, useState }  from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; 

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const [userName, setUserName] = useState("Usuario");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_BASE}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data && res.data.user) {
          setUserName(res.data.user.nombres);
        }
      } catch (err) {
        console.error("Error cargando usuario", err);
      }
    };

    fetchUser();
  }, []);

  const userInitial = userName.charAt(0).toUpperCase();

  const handleAdmin = () => {
    navigate("/admin");
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
        >Panel admin
        </button> 
      </div>

      {/* Botones lado centro */}
      <div className="flex space-x-10 items-center">
        <Link to="/perfil-admin" className="text-white hover:underline ml-16">Perfil</Link>
        <Link to="/crear-vuelos" className="text-white hover:underline">Crear Vuelos</Link>
        <Link to="/foroAdmin" className="text-white hover:underline cursor-pointer">Foro</Link>      
        
        {/* Botón Vuelos Cancelados */}
        <Link to="/vuelos-cancelados" className="text-white hover:underline cursor-pointer">
          Vuelos Cancelados
        </Link>

        {/* Botón de cerrar sesión */}
        <button onClick={handleLogout}
          className="bg-transparent border-none text-white hover:underline cursor-pointer appearance-none p-0">
          Cerrar sesión
        </button>
      </div>
      
      {/* Lado derecho: usuario + logo */}
      <div className="ml-auto flex items-center space-x-6">
        <div
          className="flex items-center space-x-2 bg-gradient-to-r from-[#004a66] to-[#00384d] 
                     px-4 py-1 rounded-full shadow-sm border border-transparent
                     hover:border-[#f97316] transition cursor-pointer"
          onClick={() => navigate("/perfil-admin")}
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