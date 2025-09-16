import { Link } from "react-router-dom";
import React from "react";
import LoginForm from "../components/LoginForm";

const LoginPage: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-6 py-10"
      style={{ backgroundImage: "url('/images/fondologin (2).jpg')" }} //imagen de fondo
    >
      {/* Rectángulo vertical */}
      <div className="bg-[#003b5eff] backdrop-blur-md p-10 rounded-2xl shadow-lg w-full max-w-md flex flex-col items-center text-white">
        
        {/* Logo */}
        <Link to="/">
          <img
            src="/images/0.png"
            alt="Logo Bienvenida"
            className="w-32 h-32 mb-6"
          />
        </Link>

        {/* Mensaje de bienvenida */}
        <h1 className="text-3xl font-bold mb-8 text-center">
          Iniciar sesión
        </h1>

        {/* Formulario */}
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
