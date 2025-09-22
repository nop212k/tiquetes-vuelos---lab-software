import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) return toast.error("Contraseñas no coinciden");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw data;
      toast.success("Contraseña actualizada. Ahora puedes ingresar.");
      window.location.href = "/login";
    } catch (err: any) {
      toast.error(err?.message || "Error al resetear contraseña");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl mb-4">Restablecer contraseña</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nueva contraseña" className="border p-2 rounded w-full" />
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirmar contraseña" className="border p-2 rounded w-full" />
        <button disabled={loading} className="bg-[#003b5eff] text-white px-4 py-2 rounded w-full">{loading ? "Guardando..." : "Guardar contraseña"}</button>
      </form>
    </div>
  );
}
