// frontend/src/components/root/Navbarroot.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Root");

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

  const handleCAdmind = () => {
    navigate("/registro-admin");
  };

  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <nav className="bg-gradient-to-r from-[#005f7f] to-[#003b5eff] p-4 flex justify-between items-center shadow-md">
      <div className="flex space-x-10">
        <Link to="/perfil-root" className="text-white hover:underline">Perfil</Link>
        <Link to="/foroAdmin" className="text-white hover:underline cursor-pointer">Foro</Link>
        <button 
          onClick={handleCAdmind}
          className="bg-transparent border-none text-white hover:underline cursor-pointer appearance-none p-0"
        >
          Registrar Administrador
        </button>      
        
        {/* Botón de cerrar sesión */}
        <button 
          onClick={handleLogout}
          className="bg-transparent border-none text-white hover:underline cursor-pointer appearance-none p-0"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Logo y usuario a la derecha */}
      <div className="ml-auto flex space-x-6 items-center">
        <div
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-700
                     px-4 py-1 rounded-full shadow-sm border border-transparent
                     hover:border-[#f97316] transition cursor-pointer"
          onClick={() => navigate("/perfil-root")}
          title="Ir a mi perfil"
        >
          <span className="bg-white text-purple-600 font-bold w-6 h-6 flex items-center justify-center rounded-full">
            {userInitial}
          </span>
          <span className="text-white font-medium">{userName}</span>
          <span className="text-white/80 text-xs">👑</span>
        </div>
        <img src="/images/letralogosin.png" alt="Letra" className="h-10 w-auto"/>
        <img src="/images/1.png" alt="Logo" className="h-10 w-auto"/>
      </div>
    </nav>
  );
};

export default Navbar;