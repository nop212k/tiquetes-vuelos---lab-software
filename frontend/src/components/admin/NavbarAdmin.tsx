// frontend/src/components/admin/NavbarAdmin.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NavbarAdmin() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const name = user ? (user.nombres || user.usuario || user.correo) : "Admin";

  return (
    <nav className="bg-[#003b5eff] text-white p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Link to="/admin" className="font-bold text-lg">Panel Admin</Link>
        <Link to="/admin/flights" className="hover:underline">Vuelos</Link>
        <Link to="/admin/create" className="hover:underline">Crear vuelo</Link>
      </div>
      <div className="flex items-center gap-4">
        <div>{name}</div>
        <button onClick={handleLogout} className="bg-white text-[#003b5eff] px-3 py-1 rounded">Salir</button>
      </div>
    </nav>
  );
}
