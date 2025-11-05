import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [login, setLogin] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ Hook de React Router

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw data;

      toast.success("Si existe la cuenta, se ha enviado un email con instrucciones.");

      // ✅ Redirigir al login después de 1.5s
      setTimeout(() => {
        navigate("/login");
      }, 1500);

      // En dev, mostrar la URL de reset en consola
      if (data.resetUrl) {
        console.log("Reset URL (dev):", data.resetUrl);
        toast.info("Reset URL en consola (modo dev)");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error enviando petición");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl mb-4">Recuperar contraseña</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Usuario o correo"
          className="border p-2 rounded w-full"
          disabled={loading}
        />
        <button
          disabled={loading}
          className="bg-[#003b5eff] text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Enviando..." : "Enviar instrucciones"}
        </button>
      </form>
    </div>
  );
}
