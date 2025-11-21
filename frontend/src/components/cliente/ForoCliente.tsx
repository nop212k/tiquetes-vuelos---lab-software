// src/pages/ForoCliente.tsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

interface User {
  id: number;
  nombres: string;
  tipo: string;
}

interface Mensaje {
  id: number;
  mensaje: string;
  fecha: string;
  usuario?: User;
  administrador?: User;
}

interface Chat {
  id: number;
  mensajes: Mensaje[];
}

const ForoCliente: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("token");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/chats/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Si no existe chat, crearlo vacío
        if (!res.data) {
          const nuevoChat = await axios.post(
            `${API_BASE}/api/chats/`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setChat(nuevoChat.data);
        } else {
          setChat(res.data);
        }
      } catch (err) {
        console.error("Error cargando chat:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chat) return;

    try {
      const res = await axios.post(
        `${API_BASE}/api/chats/messages`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChat((prev) =>
        prev ? { ...prev, mensajes: [...prev.mensajes, res.data] } : prev
      );
      setNewMessage("");
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  };

  if (loading)
    return (
      <div className="p-4 text-center text-lg text-gray-500">
        Cargando chat...
      </div>
    );

  return (
    <div
      className="flex flex-col h-screen p-4"
      style={{
        backgroundImage: 'url(/images/fonbusq1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* ENCABEZADO */}
      <div className="flex justify-center mb-4">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg text-center">
          Bienvenido a nuestro foro, en Pearl Airlines estamos contigo.
        </h1>
      </div>

      {/* CONTENEDOR DE MENSAJES */}
      <div
        className="flex-1 w-1/2 mx-auto overflow-y-auto p-4 rounded-xl shadow-inner bg-white/80 border border-gray-200 backdrop-blur-sm relative"
      >
        <div className="absolute inset-0 pointer-events-none opacity-10 flex justify-center items-center">
          <img
            src="/images/fondosin2.png"
            alt="Logo transparente"
            className="w-48 h-48 object-contain"
          />
        </div>

        <div className="relative z-10">
          {chat?.mensajes.length ? (
            chat.mensajes.map((msg) => {
              const isAdmin = !!msg.administrador;
              const nombre = isAdmin ? msg.administrador!.nombres : "Tú";

              let fecha: string;
              try {
                fecha = msg.fecha ? new Date(msg.fecha).toLocaleString() : "Sin fecha";
              } catch {
                fecha = "Sin fecha";
              }

              return (
                <div
                  key={msg.id}
                  className={`mb-3 flex ${isAdmin ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-xl shadow-sm ${
                      isAdmin
                        ? "bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white"
                        : "bg-gradient-to-r from-[#10b981] to-[#22c55e] text-white"
                    }`}
                  >
                    <div className="font-semibold">{nombre}</div>
                    <div>{msg.mensaje}</div>
                    <div className="text-xs text-gray-200 mt-1 text-right">{fecha}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-gray-700 text-center mt-10">
              No hay mensajes todavía.
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT MENSAJE */}
      <div className="mt-4 flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          placeholder="Escribe tu mensaje..."
          className="flex-1 border-2 border-gray-300 rounded-full p-3 focus:outline-none focus:border-[#005f7f]"
        />
        <button
          onClick={handleSendMessage}
          className="bg-gradient-to-r from-[#005f7f] to-[#003b5eff] text-white px-6 py-3 rounded-full font-semibold hover:from-[#0284c7] hover:to-[#0369a1] transition"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default ForoCliente;
