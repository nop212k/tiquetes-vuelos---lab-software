import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tipoDocumento: "",
    documento: "",
    nombres: "",
    apellidos: "",
    fechaNacimiento: "",
    lugarNacimiento: "",
    direccion: "",
    genero: "",
    correo: "",
    usuario: "",
    contrasena: "",
    repetirContrasena: "",
    foto: null as File | null,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const today = new Date();
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 70);
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() - 18);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });

    // Validación en tiempo real
    let errorMsg = "";
    if (name === "nombres" || name === "apellidos" || name === "lugarNacimiento") {
      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
        errorMsg = "Solo se permiten letras y espacios.";
      }
    }
    if (name === "documento") {
        if (!/^\d{8,10}$/.test(value)) {
            errorMsg = "La cédula debe tener entre 8 y 10 dígitos.";
      }
    }
    if (name === "contrasena") {
      if (value.length < 10) errorMsg = "Mínimo 10 caracteres.";
      else if (!/[A-Z]/.test(value)) errorMsg = "Debe tener al menos una mayúscula.";
      else if (!/[0-9]/.test(value)) errorMsg = "Debe tener al menos un número.";
      else if (/[^a-zA-Z0-9]/.test(value)) errorMsg = "No se permiten símbolos.";
    }
    if (name === "repetirContrasena") {
      if (value !== formData.contrasena) errorMsg = "Las contraseñas no coinciden.";
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar errores antes de enviar
    const hasErrors = Object.values(errors).some((err) => err.length > 0);
    if (hasErrors) {
      alert("Corrige los errores antes de enviar.");
      return;
    }

    // FormData para enviar archivos
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) data.append(key, value as string | Blob);
    });

    try {
      const res = await fetch("http://localhost:8000/api/users/register", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Error en el registro");
      const responseData = await res.json();
      console.log("Registro exitoso:", responseData);
      alert("✅ Registro exitoso");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("❌ Error al registrar usuario");
    }
  };

  // Validación general para habilitar botón
  const isFormValid =
    formData.tipoDocumento &&
    formData.documento &&
    formData.nombres &&
    formData.apellidos &&
    formData.fechaNacimiento &&
    formData.lugarNacimiento &&
    formData.direccion &&
    formData.genero &&
    formData.correo &&
    formData.usuario &&
    formData.contrasena &&
    formData.repetirContrasena &&
    Object.values(errors).every((err) => err === "");

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white text-black rounded-lg p-6 w-full max-w-md shadow-lg flex flex-col space-y-4"
    >
      <select
        name="tipoDocumento"
        value={formData.tipoDocumento}
        onChange={handleChange}
        className="border p-2 rounded"
      >
        <option value="">Tipo de documento</option>
        <option value="CC">Cédula</option>
        <option value="TI">Tarjeta de Identidad</option>
        <option value="CE">Cédula de Extranjería</option>
      </select>

      <input
        type="text"
        name="documento"
        placeholder="Número de documento"
        value={formData.documento}
        onChange={handleChange}
        className="border p-2 rounded"
      />
      {errors.documento && <p className="text-red-500 text-sm">{errors.documento}</p>}

      <input
        type="text"
        name="nombres"
        placeholder="Nombres"
        value={formData.nombres}
        onChange={handleChange}
        className="border p-2 rounded"
      />
      {errors.nombres && <p className="text-red-500 text-sm">{errors.nombres}</p>}

      <input
        type="text"
        name="apellidos"
        placeholder="Apellidos"
        value={formData.apellidos}
        onChange={handleChange}
        className="border p-2 rounded"
      />
      {errors.apellidos && <p className="text-red-500 text-sm">{errors.apellidos}</p>}

      <input
        type="date"
        name="fechaNacimiento"
        min={minDate.toISOString().split("T")[0]}
        max={maxDate.toISOString().split("T")[0]}
        value={formData.fechaNacimiento}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        type="text"
        name="lugarNacimiento"
        placeholder="Lugar de nacimiento"
        value={formData.lugarNacimiento}
        onChange={handleChange}
        className="border p-2 rounded"
      />
      {errors.lugarNacimiento && <p className="text-red-500 text-sm">{errors.lugarNacimiento}</p>}

      <input
        type="text"
        name="direccion"
        placeholder="Dirección"
        value={formData.direccion}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <select
        name="genero"
        value={formData.genero}
        onChange={handleChange}
        className="border p-2 rounded"
      >
        <option value="">Género</option>
        <option value="M">Masculino</option>
        <option value="F">Femenino</option>
        <option value="O">Otro</option>
      </select>

      <input
        type="email"
        name="correo"
        placeholder="Correo electrónico"
        value={formData.correo}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        type="text"
        name="usuario"
        placeholder="Usuario"
        value={formData.usuario}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        type="password"
        name="contrasena"
        placeholder="Contraseña"
        value={formData.contrasena}
        onChange={handleChange}
        className="border p-2 rounded"
      />
      {errors.contrasena && <p className="text-red-500 text-sm">{errors.contrasena}</p>}

      <input
        type="password"
        name="repetirContrasena"
        placeholder="Repetir contraseña"
        value={formData.repetirContrasena}
        onChange={handleChange}
        className="border p-2 rounded"
      />
      {errors.repetirContrasena && <p className="text-red-500 text-sm">{errors.repetirContrasena}</p>}

      <input
        type="file"
        name="foto"
        accept="image/*"
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <button
        type="submit"
        disabled={!isFormValid}
        className={`p-2 rounded text-white ${
          isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Registrarse
      </button>
    </form>
  );
};

export default RegisterForm;
