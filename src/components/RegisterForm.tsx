import React, { useState } from "react";

const RegisterForm: React.FC = () => {
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

  // Fechas mínimas y máximas
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
  };

  // Validaciones de contraseña
  const validatePassword = (password: string): string => {
    if (password.length < 10) {
      return "La contraseña debe tener al menos 10 caracteres.";
    }
    if (!/[A-Z]/.test(password)) {
      return "La contraseña debe contener al menos una letra mayúscula.";
    }
    if (!/[0-9]/.test(password)) {
      return "La contraseña debe contener al menos un número.";
    }
    if (/[^a-zA-Z0-9]/.test(password)) {
      return "La contraseña no debe contener símbolos especiales.";
    }
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar contraseña
    const passwordError = validatePassword(formData.contrasena);
    if (passwordError) {
      setErrors({ contrasena: passwordError });
      return;
    }

    // Confirmar contraseñas
    if (formData.contrasena !== formData.repetirContrasena) {
      setErrors({ repetirContrasena: "Las contraseñas no coinciden." });
      return;
    }

    setErrors({});
    console.log("Datos del formulario:", formData);
    alert("Registro exitoso ✅");
  };

  // Verificar si todos los campos obligatorios están completos
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
    !validatePassword(formData.contrasena) &&
    formData.contrasena === formData.repetirContrasena;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white text-black rounded-lg p-6 w-full max-w-md shadow-lg flex flex-col space-y-4"
    >
      {/* Tipo de Documento */}
      <select
        name="tipoDocumento"
        value={formData.tipoDocumento}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded bg-white text-black"
      >
        <option value="">Tipo de Documento</option>
        <option value="CC">Cédula de Ciudadanía</option>
        <option value="TI">Tarjeta de Identidad</option>
        <option value="CE">Cédula de Extranjería</option>
        <option value="PP">Pasaporte</option>
      </select>

      {/* Documento */}
      <input
        type="text"
        name="documento"
        placeholder="Número de Documento"
        value={formData.documento}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded bg-white text-black"
      />

      {/* Nombres */}
      <input
        type="text"
        name="nombres"
        placeholder="Nombres"
        value={formData.nombres}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded bg-white text-black"
      />

      {/* Apellidos */}
      <input
        type="text"
        name="apellidos"
        placeholder="Apellidos"
        value={formData.apellidos}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded bg-white text-black"
      />

      {/* Fecha de Nacimiento */}
      <input
        type="date"
        name="fechaNacimiento"
        value={formData.fechaNacimiento}
        onChange={handleChange}
        min={minDate.toISOString().split("T")[0]}
        max={maxDate.toISOString().split("T")[0]}
        required
        className="w-full p-2 border rounded bg-white text-black"
      />

      {/* Lugar de Nacimiento */}
      <input
        type="text"
        name="lugarNacimiento"
        placeholder="Lugar de Nacimiento (Ciudad, País)"
        value={formData.lugarNacimiento}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded bg-white text-black"
      />

      {/* Dirección */}
      <input
        type="text"
        name="direccion"
        placeholder="Dirección de Facturación"
        value={formData.direccion}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded bg-white text-black"
      />

      {/* Género */}
      <select
        name="genero"
        value={formData.genero}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded bg-white text-black"
      >
        <option value="">Selecciona tu género</option>
        <option value="M">Masculino</option>
        <option value="F">Femenino</option>
        <option value="O">Otro</option>
      </select>

      {/* Correo */}
      <input
        type="email"
        name="correo"
        placeholder="Correo Electrónico"
        value={formData.correo}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded bg-white text-black"
      />

      {/* Usuario */}
      <input
        type="text"
        name="usuario"
        placeholder="Nombre de Usuario"
        value={formData.usuario}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded bg-white text-black"
      />

      {/* Contraseña */}
      <div>
        <input
          type="password"
          name="contrasena"
          placeholder="Contraseña"
          value={formData.contrasena}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded bg-white text-black"
        />

        {/* Reglas dinámicas */}
        <ul className="mt-2 text-sm">
          <li
            className={
              formData.contrasena.length >= 10
                ? "text-green-600"
                : "text-red-500"
            }
          >
            {formData.contrasena.length >= 10 ? "✅" : "❌"} Al menos 10
            caracteres
          </li>
          <li
            className={
              /[A-Z]/.test(formData.contrasena)
                ? "text-green-600"
                : "text-red-500"
            }
          >
            {/[A-Z]/.test(formData.contrasena) ? "✅" : "❌"} Una letra mayúscula
          </li>
          <li
            className={
              /[0-9]/.test(formData.contrasena)
                ? "text-green-600"
                : "text-red-500"
            }
          >
            {/[0-9]/.test(formData.contrasena) ? "✅" : "❌"} Un número
          </li>
          <li
            className={
              !/[^a-zA-Z0-9]/.test(formData.contrasena)
                ? "text-green-600"
                : "text-red-500"
            }
          >
            {!/[^a-zA-Z0-9]/.test(formData.contrasena) ? "✅" : "❌"} Sin
            símbolos especiales
          </li>
        </ul>
      </div>

      {/* Repetir Contraseña */}
      <div>
        <input
          type="password"
          name="repetirContrasena"
          placeholder="Repite la Contraseña"
          value={formData.repetirContrasena}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded bg-white text-black"
        />
        {formData.repetirContrasena &&
          formData.contrasena !== formData.repetirContrasena && (
            <p className="text-red-500 text-sm">
              ❌ Las contraseñas no coinciden
            </p>
          )}
      </div>

      {/* Foto de Perfil (Opcional) */}
      <div>
        <label className="block mb-1 text-sm text-gray-700">
          Foto de Perfil (opcional)
        </label>
        <input
          type="file"
          name="foto"
          accept="image/*"
          onChange={handleChange}
          className="w-full p-2 border rounded bg-white text-black"
        />
      </div>

      {/* Botón */}
      <button
        type="submit"
        disabled={!isFormValid}
        className={`w-full p-2 rounded text-white ${
          isFormValid
            ? "bg-[#003b5e] hover:bg-[#005f8a]"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Registrarse
      </button>
    </form>
  );
};

export default RegisterForm;
