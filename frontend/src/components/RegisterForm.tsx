// frontend/src/components/RegisterForm.tsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";



const registerSchema = z.object({
  tipoDocumento: z.enum(["CC","TI","CE"], { required_error: "Seleccione tipo documento" }),
  documento: z.string().regex(/^\d{8,10}$/, "La cédula debe tener entre 8 y 10 dígitos"),
  nombres: z.string().min(2, "Ingrese nombres"),
  apellidos: z.string().min(2, "Ingrese apellidos"),
  fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato fecha inválido"),
  lugarNacimiento: z.string().min(2, "Seleccione lugar de nacimiento"),
  direccion: z.string().min(5, "Dirección muy corta"),
  genero: z.enum(["M","F","O"], { required_error: "Seleccione género" }),
  correo: z.string().email("Correo inválido"),
  usuario: z.string().min(3, "Usuario mínimo 3 caracteres"),
  contrasena: z.string()
    .min(10, "Mínimo 10 caracteres")
    .refine(v => /[A-Z]/.test(v), "Debe incluir mayúscula")
    .refine(v => /[0-9]/.test(v), "Debe incluir número")
    .refine(v => !/[^a-zA-Z0-9]/.test(v), "No se permiten símbolos"),
  repetirContrasena: z.string(),
}).refine(data => data.contrasena === data.repetirContrasena, {
  message: "Las contraseñas no coinciden",
  path: ["repetirContrasena"],
});

type Ciudad = {
  id: string;
  nombre: string;
  region: string;
  pais: string;
};


type FormData = z.infer<typeof registerSchema>;


//Definicion de rangos para fecha de nacimiento
const today = new Date();
const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()); // mínimo 18 años
const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate()); // máximo 100 años

// Convertir a formato YYYY-MM-DD para el input
const formatDate = (d: Date) => d.toISOString().split("T")[0];

//-------------------------------------------------------------------------------------------------------------

export default function RegisterForm() {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoName, setFotoName] = useState<string | null>(null);
  const contrasena = watch("contrasena") || "";

  //ciudades lugar de nacimiento ----------------------------------------------------------------

  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [query, setQuery] = useState(""); // lo que escribe el usuario
  const [selectedCiudad, setSelectedCiudad] = useState<Ciudad | null>(null);

  // --- Autocomplete de ciudades ---
  useEffect(() => {
    if (!query) return setCiudades([]);
    const timer = setTimeout(async () => {
      try {
        setLoadingCiudades(true);
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/cities?nombre=${query}`);
        const data = await res.json();
        setCiudades(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCiudades(false);
      }
    }, 300); // espera 300ms para no llamar la API a cada tecla
    return () => clearTimeout(timer);
  }, [query]);

  // --- Registro de ciudad seleccionada ---
  function handleSelectCiudad(c: Ciudad) {
    setValue("lugarNacimiento", c.nombre); // guarda en el formulario
    setQuery(c.nombre); // muestra en el input
    setSelectedCiudad(c); // ✅ solo se puede registrar si se selecciona
    setCiudades([]); // cierra dropdown
  }


//------------------------------------------------------------------------------------

  const strength = (() => {
    let s = 0;
    if (contrasena.length >= 10) s++;
    if (/[A-Z]/.test(contrasena)) s++;
    if (/[0-9]/.test(contrasena)) s++;
    if (!/[^a-zA-Z0-9]/.test(contrasena)) s++;
    return s;
  })();

  useEffect(() => {
    if (!fotoFile) { setFotoPreview(null); setFotoName(null); return; }
    const url = URL.createObjectURL(fotoFile);
    setFotoPreview(url);
    setFotoName(fotoFile.name);
    return () => URL.revokeObjectURL(url);
  }, [fotoFile]);

  async function onSubmit(data: FormData) {
    if (!selectedCiudad) {
    toast.error("Debes seleccionar una ciudad de la lista");
    return;
    }
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (k === "repetirContrasena") return;
        formData.append(k, String(v));
      });
      if (fotoFile) formData.append("foto", fotoFile);

      const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/api/users/register`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Error en registro" }));
        throw new Error(err.message || "Error en registro");
      }
      toast.success("Registro exitoso 🎉");
      window.location.href = "/login";
    } catch (err: any) {
      toast.error(err?.message || "Error al registrar");
    }
  }

  // clase que fuerza color visible (usa !important para sobreescribir reglas globales conflictivas)
  const authInputCls = "border p-2 rounded bg-white text-black placeholder-gray-400 auth-input [appearance:auto] [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:block [&::-webkit-calendar-picker-indicator]:cursor-pointer";


  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <style>{`
        /* Small helper: make sure text in these inputs is visible even if global CSS tries to override */
        .auth-input { color: #000 !important; }
        .auth-input::placeholder { color: #9CA3AF !important; } /* placeholder-gray-400 */
      `}</style>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-[#003b5eff] to-[#005f8a] text-white p-8">
          <h2 className="text-2xl font-bold">Crea tu cuenta</h2>
          <p className="mt-2 text-sm opacity-90 text-center">Regístrate y comienza a buscar y gestionar tus vuelos con facilidad.</p>
          <div className="mt-6 w-36 h-36 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-16 h-16 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M2 12l20-8-8 20-2-7-6-5z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Avatar + file */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-sm">Avatar</span>
                )}
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Foto (opcional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setFotoFile(f);
                    }}
                    className="text-sm"
                    aria-label="Subir foto de perfil"
                  />
                  <div className="text-xs text-gray-600">{fotoName ?? ""}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select {...register("tipoDocumento")} className={authInputCls} aria-label="Tipo de documento">
                <option value="">Tipo documento</option>
                <option value="CC">Cédula</option>
                <option value="TI">Tarjeta Identidad</option>
                <option value="CE">Cédula Extranjería</option>
              </select>

              <input
                {...register("documento")}
                placeholder="Número de documento"
                className={authInputCls}
                inputMode="numeric"
                type="text"
                aria-invalid={!!errors.documento}
                aria-describedby={errors.documento ? "err-documento" : undefined}
              />
            </div>
            {errors.documento && <p id="err-documento" className="text-red-600 text-sm">{errors.documento.message}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input {...register("nombres")} placeholder="Nombres" className={authInputCls} aria-invalid={!!errors.nombres} />
              <input {...register("apellidos")} placeholder="Apellidos" className={authInputCls} aria-invalid={!!errors.apellidos} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"> 
              <input
                type="date"
                {...register("fechaNacimiento")}
                className={authInputCls}
                aria-invalid={!!errors.fechaNacimiento}
                min={formatDate(minDate)}
                max={formatDate(maxDate)}
              />
              <div className="relative">
                <input     //Lugar de nacimiento -----------------------
                  type="text"
                  {...register("lugarNacimiento")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Lugar de nacimiento"
                  className={authInputCls}
                />
                {loadingCiudades && <div className="absolute right-2 top-2">Cargando...</div>}

                {ciudades.length > 0 && (
                  <ul className="absolute z-50 w-full bg-white border mt-1 max-h-48 overflow-auto">
                    {ciudades.map(c => (
                      <li
                        key={c.id}
                        className="p-2 hover:bg-gray-200 cursor-pointer text-black"
                        onClick={() => handleSelectCiudad(c)}
                      >
                        {c.nombre} - {c.region}, {c.pais}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <input {...register("direccion")} placeholder="Dirección" className={authInputCls} aria-invalid={!!errors.direccion} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select {...register("genero")} className={authInputCls} aria-invalid={!!errors.genero}>
                <option value="">Género</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>

              <input {...register("correo")} placeholder="Correo electrónico" className={authInputCls} inputMode="email" type="email" aria-invalid={!!errors.correo} />
            </div>

            <input {...register("usuario")} placeholder="Usuario" className={authInputCls} aria-invalid={!!errors.usuario} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input type="password" {...register("contrasena")} placeholder="Contraseña" className={authInputCls} aria-invalid={!!errors.contrasena} />
                {errors.contrasena && <p className="text-red-600 text-sm mt-1">{errors.contrasena.message}</p>}
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${strength >= 3 ? "bg-green-500" : strength === 2 ? "bg-yellow-400" : "bg-red-400"}`}
                      style={{ width: `${(strength / 4) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Contraseña: {strength >= 3 ? "Fuerte" : strength === 2 ? "Media" : "Débil"}</p>
                </div>
              </div>

              <div>
                <input type="password" {...register("repetirContrasena")} placeholder="Repetir contraseña" className={authInputCls} aria-invalid={!!errors.repetirContrasena} />
                {errors.repetirContrasena && <p className="text-red-600 text-sm mt-1">{errors.repetirContrasena.message}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="news"
                type="checkbox"
                {...register("suscritoNoticias" as any)}
                className="w-5 h-5 rounded-sm border border-gray-300 bg-white accent-[#003b5eff] focus:ring-2 focus:ring-[#003b5eff]"
                aria-label="Deseo recibir ofertas y noticias"
              />
              <label htmlFor="news" className="text-sm text-gray-700 select-none">
                Deseo recibir ofertas y noticias
              </label>
            </div>


            <button disabled={isSubmitting} className={`w-full py-3 rounded text-white ${isSubmitting ? "bg-gray-400" : "bg-[#003b5eff] hover:bg-[#005f8a]"}`}>
              {isSubmitting ? "Registrando..." : "Crear cuenta"}
            </button>

            <p className="text-center text-sm text-gray-500">¿Ya tienes una cuenta? <a href="/login" className="text-[#003b5eff] hover:underline">Inicia sesión</a></p>
          </form>
        </div>
      </div>
    </div>
  );
}
