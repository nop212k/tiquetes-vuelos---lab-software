// src/components/admin/NavbarAdmin.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const NavbarAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Admin");
  const [hayMensajesNuevos, setHayMensajesNuevos] = useState(false);

  // Obtener usuario
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

  // Revisar si hay mensajes nuevos
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_BASE}/api/chats/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const tieneNuevos = res.data.some((chat: any) => chat.tieneNoLeidos);
        setHayMensajesNuevos(tieneNuevos);
      } catch (err) {
        console.error("Error cargando chats", err);
      }
    };

    fetchChats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <nav className="bg-gradient-to-r from-[#005f7f] to-[#003b5eff] p-4 flex justify-between items-center shadow-md">
      {/* Lado izquierdo: botón destacado */}
      <div className="flex items-center space-x-8">
        <button
          onClick={() => navigate("/admin")}
          className="bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white font-semibold px-6 py-2 rounded-lg 
                     shadow-sm hover:shadow-md hover:border-[#f97316] border border-transparent transition"
        >
          Panel admin
        </button>
      </div>

      {/* Centro: links */}
      <div className="flex items-center space-x-6">
        <Link
          to="/perfil-admin"
          className="flex items-center space-x-2 text-white hover:underline whitespace-nowrap"
        >
          <span className="bg-[#0ea5e9] text-white font-bold w-6 h-6 flex items-center justify-center rounded-full">
            {userInitial}
          </span>
          <span className="text-white font-medium">{userName}</span>
        </Link>

        <Link
          to="/crear-vuelos"
          className="text-white hover:underline whitespace-nowrap"
        >
          Crear Vuelos
        </Link>

        <Link
          to="/foroAdmin"
          className="flex items-center relative text-white hover:underline whitespace-nowrap"
        >
          Foro
          {hayMensajesNuevos && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </Link>

        <Link
          to="/vuelos-cancelados"
          className="text-white hover:underline whitespace-nowrap"
        >
          Vuelos Cancelados
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center text-white bg-transparent border-none hover:underline cursor-pointer whitespace-nowrap"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Lado derecho: logos */}
      <div className="ml-auto flex items-center space-x-6">
        <img src="/images/letralogosin.png" alt="Letra" className="h-10 w-auto" />
        <img src="/images/1.png" alt="Logo" className="h-10 w-auto" />
      </div>
    </nav>
  );
};

export default NavbarAdmin;
