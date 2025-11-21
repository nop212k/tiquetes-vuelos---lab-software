// src/pages/ForoAdminLista.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

interface Usuario {
  id: number;
  nombres: string;
}

interface Mensaje {
  id: number;
  mensaje: string;
  fecha: string;
  usuario?: Usuario;
  administrador?: Usuario;
}

interface Chat {
  id: number;
  cliente: Usuario;
  mensajes: Mensaje[];
}

const ForoAdminLista: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/chats/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(res.data);
      } catch (err) {
        console.error("Error cargando chats:", err);
      }
    };

    fetchChats();
  }, [token]);

  const getUltimoMensaje = (mensajes: Mensaje[]) => {
    if (!mensajes || mensajes.length === 0) return { texto: "Sin mensajes", fecha: "" };
    const ultimo = mensajes[mensajes.length - 1];
    let fecha = "Sin fecha";
    try {
      fecha = new Date(ultimo.fecha).toLocaleString();
    } catch {}
    return { texto: ultimo.mensaje, fecha };
  };

  return (
    <div
      className="flex flex-col h-screen p-6"
      style={{
        backgroundImage: 'url(/images/fonbusq1.jpg)',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* TÍTULO */}
      <div className="flex justify-center mb-8">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg text-center">
          Chats abiertos con clientes
        </h1>
      </div>

      {/* CONTENEDOR LISTA DE CHATS */}
      <div
        className="flex-1 overflow-y-auto p-4 rounded-xl shadow-inner bg-white/80 border border-gray-200 backdrop-blur-md relative"
        style={{ opacity: 1 }}
      >
        {/* LOGO TRANSPARENTE */}
        <div className="absolute inset-0 pointer-events-none opacity-10 flex justify-center items-center">
          <img
            src="/images/fondosin2.png"
            alt="Logo transparente"
            className="w-48 h-48 object-contain"
          />
        </div>

        {/* LISTA */}
        <div className="relative z-10 space-y-4">
          {chats.length > 0 ? (
            chats.map((chat) => {
              const { texto, fecha } = getUltimoMensaje(chat.mensajes);
              return (
                <div
                  key={chat.id}
                  onClick={() => (window.location.href = `/admin/chat/${chat.id}`)}
                  className="p-4 bg-white/90 backdrop-blur-sm border border-gray-300 shadow-md rounded-xl cursor-pointer
                  hover:bg-white hover:shadow-lg transition duration-200"
                >
                  <h2 className="text-xl font-semibold text-gray-800">
                    {chat.cliente.nombres}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">{texto}</p>
                  {fecha && (
                    <p className="text-gray-400 text-xs mt-1 text-right">
                      {fecha}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-600 mt-10 text-lg">
              No hay chats abiertos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForoAdminLista;
