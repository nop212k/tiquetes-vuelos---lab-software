// frontend/src/components/cliente/NavbarCliente.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const NavbarCliente: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Cliente");
  
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <nav className="bg-gradient-to-r from-[#005f7f] to-[#003b5eff] p-4 flex justify-between items-center shadow-md">
      {/* Lado izquierdo: navegación */}
      <div className="flex space-x-8 items-center">
        <Link to="/foro" className="text-white hover:underline">Foro</Link>
        <Link to="/noticias" className="text-white hover:underline">Noticias</Link>
        <Link to="/perfil-cliente" className="text-white hover:underline">Perfil</Link>
        <Link to="/historial" className="text-white hover:underline">Historial</Link>
        <Link to="/checkin" className="text-white hover:underline">Check in</Link>
        <button
          onClick={handleLogout}
          className="bg-transparent border-none text-white hover:underline cursor-pointer"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Lado derecho: usuario + logo */}
      <div className="ml-auto flex items-center space-x-6">
        <div
          className="flex items-center space-x-2 bg-gradient-to-r from-[#004a66] to-[#00384d] 
                     px-4 py-1 rounded-full shadow-sm border border-transparent
                     hover:border-[#f97316] transition cursor-pointer"
          onClick={() => navigate("/perfil-cliente")}
          title="Ir a mi perfil"
        >
          <span className="bg-[#0ea5e9] text-white font-bold w-6 h-6 flex items-center justify-center rounded-full">
            {userInitial}
          </span>
          <span className="text-white font-medium">{userName}</span>
        </div>
        <img src="/images/letralogosin.png" alt="Letra" className="h-10 w-auto"/>
        <img src="/images/1.png" alt="Logo" className="h-10 w-auto"/>
      </div>
    </nav>
  );
};

export default NavbarCliente;