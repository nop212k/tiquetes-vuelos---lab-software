import { useEffect, useState } from "react";
import Navbar from "../components/root/Navbarroot";

const API_URL = "http://localhost:8000/api";

interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  usuario: string;
  correo: string;
  tipo: string;
  tipoDocumento?: string;
  documento?: string;
  fechaNacimiento?: string;
  lugarNacimiento?: string;
  direccion?: string;
  genero?: string;
  foto?: string;
}

interface Ciudad {
  id: string;
  nombre: string;
  region: string;
  pais: string;
}

interface EditFormData {
  nombres: string;
  apellidos: string;
  usuario: string;
  correo: string;
  tipo: string;
  tipoDocumento: string;
  documento: string;
  fechaNacimiento: string;
  lugarNacimiento: string;
  direccion: string;
  genero: string;
}

const Root = () => {
  const [admins, setAdmins] = useState<Usuario[]>([]);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    nombres: "",
    apellidos: "",
    usuario: "",
    correo: "",
    tipo: "administrador",
    tipoDocumento: "CC",
    documento: "",
    fechaNacimiento: "",
    lugarNacimiento: "",
    direccion: "",
    genero: "M"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para ciudad
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCiudad, setSelectedCiudad] = useState<Ciudad | null>(null);

  // Estados para foto
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  // Fechas para validación
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  // Cargar admins
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/root/users`);
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      setError("Error al cargar usuarios");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Buscar ciudades con debounce
  useEffect(() => {
    if (!query) {
      setCiudades([]);
      return;
    }
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
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Seleccionar ciudad
  const handleSelectCiudad = (c: Ciudad) => {
    setFormData(prev => ({ ...prev, lugarNacimiento: c.nombre }));
    setQuery(c.nombre);
    setSelectedCiudad(c);
    setCiudades([]);
  };

  // Abrir modal de edición
  const handleEdit = (user: Usuario) => {
    setEditingUser(user);
    setFormData({
      nombres: user.nombres,
      apellidos: user.apellidos,
      usuario: user.usuario,
      correo: user.correo,
      tipo: user.tipo,
      tipoDocumento: user.tipoDocumento || "CC",
      documento: user.documento || "",
      fechaNacimiento: user.fechaNacimiento || "",
      lugarNacimiento: user.lugarNacimiento || "",
      direccion: user.direccion || "",
      genero: user.genero || "M"
    });
    setQuery(user.lugarNacimiento || "");
    setFotoPreview(user.foto ? `${API_URL}${user.foto}` : null);
    setShowModal(true);
    setError(null);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setError(null);
    setFotoFile(null);
    setFotoPreview(null);
    setQuery("");
    setSelectedCiudad(null);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambio de foto
  useEffect(() => {
    if (!fotoFile) {
      if (!editingUser?.foto) setFotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(fotoFile);
    setFotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [fotoFile, editingUser]);

  // Guardar cambios
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      if (fotoFile) {
        formDataToSend.append("foto", fotoFile);
      }

      const res = await fetch(`${API_URL}/root/users/${editingUser.id}`, {
        method: "PUT",
        body: formDataToSend
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Error al actualizar" }));
        throw new Error(errorData.message || "Error al actualizar usuario");
      }

      await fetchUsers();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar cambios");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar usuario
  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        const res = await fetch(`${API_URL}/root/users/${id}`, { 
          method: "DELETE" 
        });
        
        if (!res.ok) {
          throw new Error("Error al eliminar usuario");
        }
        
        await fetchUsers();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al eliminar usuario");
      }
    }
  };

  const authInputCls = "border p-2 rounded bg-white text-black placeholder-gray-400 w-full";

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/fondoRoot.jpg')" }}
    >
      <Navbar />
      <div className="min-h-screen grid place-items-center p-6">
        {/* Administradores */}
        <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-4 text-red-700">
            Administradores
          </h2>

          {error && !showModal && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {admins.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay administradores registrados
            </p>
          ) : (
            <ul>
              {admins.map((a) => (
                <li
                  key={a.id}
                  className="flex justify-between items-center border-b py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="text-black flex items-center gap-3">
                    {a.foto && (
                      <img 
                        src={`${API_URL}${a.foto}`} 
                        alt={a.nombres}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    )}
                    <div>
                      <p>
                        <strong className="text-lg">
                          {a.nombres} {a.apellidos}
                        </strong>{" "}
                        <span className="text-gray-600">({a.usuario})</span>
                      </p>
                      <p className="text-gray-700">{a.correo}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Tipo: <span className="font-medium">{a.tipo}</span>
                      </p>
                    </div>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEdit(a)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal de Edición */}
      {showModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Editar Usuario Administrador
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Foto */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2">
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-sm">Avatar</span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-1">Foto de Perfil</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setFotoFile(e.target.files?.[0] ?? null)} 
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Puedes cambiar la foto o dejarla como está</p>
                </div>
              </div>

              {/* Tipo de Documento y Número */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Tipo de Documento</label>
                  <select
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleInputChange}
                    className={authInputCls}
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="CE">Cédula de Extranjería</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Número de Documento</label>
                  <input
                    type="text"
                    name="documento"
                    value={formData.documento}
                    onChange={handleInputChange}
                    className={authInputCls}
                    required
                  />
                </div>
              </div>

              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nombres</label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    className={authInputCls}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Apellidos</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    className={authInputCls}
                    required
                  />
                </div>
              </div>

              {/* Fecha de Nacimiento y Lugar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleInputChange}
                    min={formatDate(minDate)}
                    max={formatDate(maxDate)}
                    className={authInputCls}
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-700 font-medium mb-2">Lugar de Nacimiento</label>
                  <input
                    type="text"
                    name="lugarNacimiento"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={authInputCls}
                    placeholder="Buscar ciudad..."
                    required
                  />
                  {loadingCiudades && (
                    <div className="absolute right-2 top-11 text-sm text-gray-500">Buscando...</div>
                  )}
                  {ciudades.length > 0 && (
                    <ul className="absolute z-50 w-full bg-white border mt-1 max-h-48 overflow-auto rounded shadow-lg">
                      {ciudades.map((c) => (
                        <li
                          key={c.id}
                          className="p-2 hover:bg-blue-100 cursor-pointer text-black"
                          onClick={() => handleSelectCiudad(c)}
                        >
                          {c.nombre} - {c.region}, {c.pais}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className={authInputCls}
                  required
                />
              </div>

              {/* Género y Correo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Género</label>
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleInputChange}
                    className={authInputCls}
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Correo Electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    className={authInputCls}
                    required
                  />
                </div>
              </div>

              {/* Usuario y Tipo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Usuario</label>
                  <input
                    type="text"
                    name="usuario"
                    value={formData.usuario}
                    onChange={handleInputChange}
                    className={authInputCls}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Tipo de Usuario</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className={authInputCls}
                  >
                    <option value="administrador">Administrador</option>
                    <option value="usuario">Usuario</option>
                  </select>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 font-medium"
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Root;