// src/components/cliente/NavbarCliente.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const NavbarCliente: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("Cliente");
  const [tieneNoLeidos, setTieneNoLeidos] = useState(false); // ✅ Estado para puntito verde

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

    // ✅ Fetch mensajes no leídos
    const fetchMensajesNoLeidos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_BASE}/api/chats/tiene-no-leidos`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data && typeof res.data.tieneNoLeidos === "boolean") {
          setTieneNoLeidos(res.data.tieneNoLeidos);
        }
      } catch (err) {
        console.error("Error obteniendo mensajes no leídos:", err);
      }
    };

    fetchMensajesNoLeidos();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const userInitial = userName.charAt(0).toUpperCase();
  const isActive = (path: string) => location.pathname === path;
  const linkClass = (path: string) =>
    `text-white transition ${
      isActive(path) 
        ? "font-bold underline underline-offset-4" 
        : "hover:underline"
    }`;

  return (
    <nav className="bg-gradient-to-r from-[#005f7f] to-[#003b5eff] p-4 flex justify-between items-center shadow-md">
      <div className="flex space-x-8 items-center">
        <Link to="/cliente" className={linkClass("/cliente")}>🏠 Inicio</Link>
        <Link to="/historial" className={linkClass("/historial")}>Historial</Link>
        <Link to="/perfil-cliente" className={linkClass("/perfil-cliente")}>Perfil</Link>
        <Link to="/checkin" className={linkClass("/checkin")}>Check in</Link>

        {/* ✅ Link Foro con puntito verde */}
        <Link to="/foro" className={linkClass("/foro")} style={{ position: "relative" }}>
          Foro
          {tieneNoLeidos && (
            <span
              className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full"
              style={{ transform: "translate(50%, -50%)" }}
            />
          )}
        </Link>

        <Link to="/noticias" className={linkClass("/noticias")}>Noticias</Link>
        <button
          onClick={handleLogout}
          className="bg-transparent border-none text-white hover:underline cursor-pointer"
        >
          Cerrar sesión
        </button>
      </div>

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
