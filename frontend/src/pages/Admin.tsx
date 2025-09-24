import { useEffect, useState } from "react";
import Navbar from "../components/admin/NavbarAdmin"; // Asegúrate de tener un Navbar para admin

// Simular API_URL, pero no usaremos fetch por ahora
const API_URL = "http://localhost:8000/api";

interface Vuelo {
  id: number;
  origen: string;
  destino: string;
  fechaSalida: string;
  fechaLlegada: string;
  precio: number;
  estado: "activo" | "cancelado";
}

const Admin = () => {
  // Datos de vuelos de prueba (mock)
  const vuelosIniciales: Vuelo[] = [
    {
      id: 1,
      origen: "Bogotá (BOG)",
      destino: "Medellín (MDE)",
      fechaSalida: "2025-09-17T10:00:00",
      fechaLlegada: "2025-09-17T11:30:00",
      precio: 150000,
      estado: "activo",
    },
    {
      id: 2,
      origen: "Medellín (MDE)",
      destino: "Cartagena (CTG)",
      fechaSalida: "2025-09-18T14:00:00",
      fechaLlegada: "2025-09-18T15:45:00",
      precio: 200000,
      estado: "activo",
    },
    {
      id: 3,
      origen: "Cartagena (CTG)",
      destino: "Barranquilla (BAQ)",
      fechaSalida: "2025-09-19T09:00:00",
      fechaLlegada: "2025-09-19T09:45:00",
      precio: 80000,
      estado: "cancelado",
    },
  ];

  const [vuelos, setVuelos] = useState<Vuelo[]>(vuelosIniciales);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Vuelo>({
    id: 0,
    origen: "",
    destino: "",
    fechaSalida: "",
    fechaLlegada: "",
    precio: 0,
    estado: "activo",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Simular carga de vuelos (ya está en el estado inicial)
  const fetchVuelos = () => {
    // En el futuro, aquí va fetch(`${API_URL}/admin/flights`)
    // Por ahora, usa los datos iniciales
    console.log("Simulando carga de vuelos...");
  };

  useEffect(() => {
    fetchVuelos();
  }, []);

  // Crear o editar vuelo (local, sin API)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      // Editar: Actualiza el vuelo existente
      setVuelos(vuelos.map((v) => (v.id === editingId ? { ...formData, id: editingId } : v)));
    } else {
      // Crear: Añade un nuevo vuelo con ID incremental
      const newId = vuelos.length > 0 ? Math.max(...vuelos.map((v) => v.id)) + 1 : 1;
      const newVuelo: Vuelo = { ...formData, id: newId };
      setVuelos([...vuelos, newVuelo]);
    }

    setShowForm(false);
    setFormData({
      id: 0,
      origen: "",
      destino: "",
      fechaSalida: "",
      fechaLlegada: "",
      precio: 0,
      estado: "activo",
    });
    setEditingId(null);
    // En el futuro, aquí va la llamada POST/PUT a la API
  };

  // Borrar vuelo (local)
  const handleDelete = (id: number) => {
    setVuelos(vuelos.filter((v) => v.id !== id));
    // En el futuro: fetch DELETE a la API
  };

  // Cancelar vuelo (local)
  const handleCancel = (id: number) => {
    setVuelos(vuelos.map((v) => (v.id === id ? { ...v, estado: "cancelado" } : v)));
    // En el futuro: fetch PATCH a la API
  };

  // Editar vuelo
  const handleEdit = (vuelo: Vuelo) => {
    setFormData(vuelo);
    setEditingId(vuelo.id);
    setShowForm(true);
  };

  // Crear nuevo vuelo
  const handleCreate = () => {
    setFormData({
      id: 0,
      origen: "",
      destino: "",
      fechaSalida: "",
      fechaLlegada: "",
      precio: 0,
      estado: "activo",
    });
    setEditingId(null);
    setShowForm(true);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/fondoAdmin.webp')" }}
    >
      <Navbar />

      {/* Botón para crear nuevo vuelo */}
      <div className="p-6">
        <button
          onClick={handleCreate}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Crear Nuevo Vuelo
        </button>
      </div>

      {/* Formulario (visible solo al crear/editar) */}
      {showForm && (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-2xl mt-6">
          <h2 className="text-2xl font-bold mb-4 text-red-700">
            {editingId ? "Editar Vuelo" : "Crear Nuevo Vuelo"}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Origen</label>
              <input
                type="text"
                value={formData.origen}
                onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Destino</label>
              <input
                type="text"
                value={formData.destino}
                onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Salida</label>
              <input
                type="datetime-local"
                value={formData.fechaSalida}
                onChange={(e) => setFormData({ ...formData, fechaSalida: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Llegada</label>
              <input
                type="datetime-local"
                value={formData.fechaLlegada}
                onChange={(e) => setFormData({ ...formData, fechaLlegada: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio</label>
              <input
                type="number"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                {editingId ? "Guardar Cambios" : "Crear Vuelo"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de vuelos */}
      <div className="grid grid-cols-1 gap-6 p-6">
        <div className="bg-white shadow-md rounded-2xl p-4">
          <h2 className="text-2xl font-bold mb-4 text-red-700">Lista de Vuelos</h2>
          <ul>
            {vuelos.map((v) => (
              <li key={v.id} className="flex justify-between items-center border-b py-2">
                <div className="text-black">
                  <p>
                    <strong>{v.origen} → {v.destino}</strong>
                  </p>
                  <p>
                    {new Date(v.fechaSalida).toLocaleString()} - {new Date(v.fechaLlegada).toLocaleString()} | ${v.precio} | Estado: {v.estado}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(v)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleCancel(v.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    disabled={v.estado === "cancelado"}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Borrar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Admin;
