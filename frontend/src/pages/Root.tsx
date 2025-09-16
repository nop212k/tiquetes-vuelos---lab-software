import { useEffect, useState } from "react";
import Navbar from "../components/root/Navbarroot";

const API_URL = "http://localhost:8000/api"; // ajusta al puerto de tu backend

interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  usuario: string;
  correo: string;
  tipo: string;
  fechaNacimiento?: string; // opcional si quieres mostrar fecha
}

const Root = () => {
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [admins, setAdmins] = useState<Usuario[]>([]);

  // Cargar clientes y admins
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/root/users`);
      const data = await res.json();
      setClientes(data.clientes || []);
      setAdmins(data.admins || []);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Hacer admin
  const handleMakeAdmin = async (id: number) => {
    await fetch(`${API_URL}/root/users/${id}/make-admin`, { method: "POST" });
    fetchUsers();
  };

  //Volver cliente
  const handleMakeClient = async (id: number) => {
    await fetch(`${API_URL}/root/users/${id}/make-client`, { method: "POST" });
    fetchUsers();
  };

  //Eliminar usuario
  const handleDelete = async (id: number) => {
    await fetch(`${API_URL}/root/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  return (
    <div
    className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/fondoRoot.jpg')" }}>
      <Navbar />
      
      
      

      
      <div className="grid grid-cols-2 gap-6 p-6">
        
        {/* Clientes */}
        <div className="bg-white shadow-md rounded-2xl p-4">
          <h2 className="text-2xl font-bold mb-4 text-red-700">Clientes</h2>
          <ul>
            {clientes.map((c) => (
              <li key={c.id} className="flex justify-between items-center border-b py-2">
                <div className="text-black">
                  <p>
                    <strong>{c.nombres} {c.apellidos}</strong> ({c.usuario})
                  </p>
                  <p>{c.correo}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleMakeAdmin(c.id)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Hacer admin
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Administradores */}
        <div className="bg-white shadow-md rounded-2xl p-4">
          <h2 className="text-2xl font-bold mb-4 text-red-700">Administradores</h2>
          <ul>
            {admins.map((a) => (
              <li key={a.id} className="flex justify-between items-center border-b py-2">
                <div className="text-black">
                  <p>
                    <strong>{a.nombres} {a.apellidos}</strong> ({a.usuario})
                  </p>
                  <p>{a.correo}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleMakeClient(a.id)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Volver cliente
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Eliminar
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

export default Root;
