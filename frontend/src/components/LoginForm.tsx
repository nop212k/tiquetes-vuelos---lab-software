// frontend/src/components/LoginForm.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginForm: React.FC = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Login failed");

      // Guardamos token y user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || {}));
      
      // redirige según tipo
      const tipo = data.user?.tipo || data.tipoUsuario || "cliente";
      if (tipo === "admin") navigate("/admin");
      else navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error en login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <input value={login} onChange={e => setLogin(e.target.value)} placeholder="Correo o usuario" className="mb-3 p-2 rounded w-full" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Contraseña" className="mb-3 p-2 rounded w-full" />
      <button disabled={loading} className="bg-white text-black px-4 py-2 rounded w-full">{loading ? "Ingresando..." : "Ingresar"}</button>
      {error && <div className="text-red-300 mt-2">{error}</div>}
    </form>
  );
};

export default LoginForm;
