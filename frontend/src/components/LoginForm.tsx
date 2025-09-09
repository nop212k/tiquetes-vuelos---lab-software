import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // limpio errores anteriores

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: formData.login, password: formData.password })
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("❌ Usuario o contraseña incorrectos");
        } else {
          setError("⚠️ Error en el servidor");
        }
        return;
      }

      const data = await res.json();
      console.log("✅ Login exitoso:", data);

        // Guardar token en localStorage
        localStorage.setItem("token", data.token);

        // Redirigir según tipo de usuario
        if (data.tipoUsuario === "cliente") {
            navigate("/cliente");
        } else if (data.tipoUsuario === "administrador") {
            navigate("/admin");
        } else if (data.tipoUsuario === "root") {
            navigate("/root");
        };} 
        
    catch (err) {
      setError("❌ No se pudo conectar con el servidor");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-md rounded flex flex-col space-y-4 w-full max-w-sm">
      <input
        type="text"
        name="login"
        placeholder="Correo o usuario"
        value={formData.login}
        onChange={handleChange}
        className="border p-2 rounded text-black"
      />
      <input
        type="text"
        name="password"
        placeholder="Contraseña"
        value={formData.password}
        onChange={handleChange}
        className="border p-2 rounded text-black"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
        Iniciar sesión
      </button>

      {/* Link de olvidar contraseña */}
      <div className="text-center">
        <Link
          to="/forgot-password" // 👈 ruta futura
          className="text-sm text-blue-300 hover:text-blue-500"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
