import React, { useState } from "react";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const [login, setLogin] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login }),
      });
      const data = await res.json();
      if (!res.ok) throw data;
      toast.success("Si existe la cuenta, se ha enviado un email con instrucciones.");
      // En dev puedes mostrar el token/resetUrl (data.resetUrl) para probar
      if (data.resetUrl) {
        // Mostrar en consola o copiar al portapapeles
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
        <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Usuario o correo" className="border p-2 rounded w-full" />
        <button disabled={loading} className="bg-[#003b5eff] text-white px-4 py-2 rounded w-full">{loading ? "Enviando..." : "Enviar instrucciones"}</button>
      </form>
    </div>
  );
}
