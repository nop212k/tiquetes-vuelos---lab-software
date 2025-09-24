import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { postLogin } from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  login: z.union([
    z.string().min(3, "Usuario mínimo 3 caracteres"),
    z.string().email("Debe ser un correo válido")
  ]),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });
  const [show, setShow] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  async function onSubmit(data: FormData) {
    setLoginError(null);
    try {
      console.log('Intentando iniciar sesión con:', { login: data.login });
      const res = await postLogin(data);
      console.log('Respuesta de login:', res);

      if (!res || !res.token) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Guardar token y datos de usuario
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user || { tipo: res.tipoUsuario }));

      toast.success("Bienvenido!");

      // Determinar la redirección basada en el rol del usuario
      const userRole = (res.user?.tipo || res.tipoUsuario)?.toLowerCase?.();
      console.log('Rol del usuario:', userRole);

      // Usar navigate en lugar de window.location para mantener el estado de React
      if (userRole === "admin") navigate("/admin");
      else if (userRole === "root") navigate("/root");
      else if (userRole === "cliente") navigate("/cliente");
      else navigate("/");
      
    } catch (err: any) {
      console.error('Error en login:', err);
      const errorMessage = err?.message || "Usuario o contraseña incorrectos";
      setLoginError(errorMessage);
      toast.error(errorMessage);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-[#09374b] rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-white p-6">
          {loginError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario o correo</label>
              <input
                {...register("login")}
                className="w-full p-3 rounded-md border border-gray-200 bg-white text-black placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003b5eff]"
                placeholder="ej: juan.perez o correo@ejemplo.com"
                aria-invalid={!!errors.login}
              />
              {errors.login && <p className="text-red-600 text-sm mt-1">{errors.login.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={show ? "text" : "password"}
                  className="w-full p-3 rounded-md border border-gray-200 bg-white text-black placeholder-gray-400 shadow-sm pr-16 focus:outline-none focus:ring-2 focus:ring-[#003b5eff]"
                  placeholder="Tu contraseña"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="absolute right-2 top-2 text-sm text-gray-600 px-2 py-1 rounded"
                >
                  {show ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-md text-white font-medium ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#003b5eff] hover:bg-[#005f8a]"}`}
            >
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </button>

            <div className="flex justify-center mt-1">
              <a href="/forgot-password" className="text-sm text-[#003b5eff] hover:underline">¿Olvidó su contraseña?</a>
            </div>

            <div className="text-center text-sm text-gray-500">
              ¿No tienes cuenta? <a href="/registro" className="text-[#003b5eff] hover:underline">Regístrate</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
