import { Link } from "react-router-dom";
import React from "react";
import LoginForm from "../components/LoginForm";

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#003b5e] flex flex-col items-center justify-center px-6 py-10 text-white">
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
  );
};

export default LoginPage;
