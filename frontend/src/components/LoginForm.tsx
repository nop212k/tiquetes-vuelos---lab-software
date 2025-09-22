// frontend/src/components/LoginForm.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { postLogin } from "../services/api";
import { toast } from "react-toastify";

const schema = z.object({
  login: z.string().min(3, "Ingrese su usuario o correo"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});
type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });
  const [show, setShow] = useState(false);

  async function onSubmit(data: FormData) {
    try {
      const res = await postLogin(data);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user || { tipo: res.tipoUsuario }));
      toast.success("Bienvenido!");
      if (res.user?.tipo?.toLowerCase?.() === "admin" || res.tipoUsuario === "admin") window.location.href = "/admin";
      else if (res.user?.tipo?.toLowerCase?.() === "root" || res.tipoUsuario === "root") window.location.href = "/root";
      else window.location.href = "/";
    } catch (err: any) {
      toast.error(err?.message || "Error en login");
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-[#09374b] rounded-2xl shadow-xl overflow-hidden">    

        {/* form card */}
        <div className="bg-white p-6">
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

            {/* centered forgot link */}
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
