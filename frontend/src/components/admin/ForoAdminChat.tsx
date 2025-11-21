import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

interface Mensaje {
  id: number;
  message: string;
  created_at: string;
  sender: {
    id: number;
    nombres: string;
    tipo: string;
  };
}

interface Chat {
  id: number;
  cliente: {
    id: number;
    nombres: string;
  };
  mensajes: Mensaje[];
}

const ForoAdminChat: React.FC = () => {
  const { chatId } = useParams();
  const [chat, setChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const token = localStorage.getItem("token");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/admin/chat/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChat(res.data);
      } catch (err) {
        console.error("Error cargando chat:", err);
      }
    };

    fetchChat();
  }, [chatId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post(
        `${API_BASE}/api/admin/chat/${chatId}/messages`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChat(prev =>
        prev
          ? { ...prev, mensajes: [...prev.mensajes, res.data] }
          : prev
      );

      setNewMessage("");
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  if (!chat) return <div>Cargando...</div>;

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      
      <h1 className="text-2xl font-bold text-center mb-4">
        Estás hablando con <span className="text-blue-600">{chat.cliente.nombres}</span>
      </h1>

      <div className="flex-1 overflow-y-auto bg-white p-4 rounded-lg shadow-md">
        {chat.mensajes.map(msg => (
          <div
            key={msg.id}
            className={`mb-3 flex ${
              msg.sender.tipo === "admin" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-xl shadow ${
                msg.sender.tipo === "admin"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              <div className="font-semibold">{msg.sender.nombres}</div>
              <div>{msg.message}</div>
              <div className="text-xs opacity-60 mt-1 text-right">
                {new Date(msg.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <div className="mt-3 flex">
        <input
          className="flex-1 rounded-full border px-4 py-2"
          placeholder="Escribir mensaje..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />

        <button
          className="ml-2 px-6 py-2 bg-blue-600 text-white rounded-full"
          onClick={handleSend}
        >
          Enviar
        </button>
      </div>

    </div>
  );
};

export default ForoAdminChat;
