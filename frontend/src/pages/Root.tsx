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
  const [admins, setAdmins] = useState<Usuario[]>([]);

  // Cargar admins
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/root/users`);
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

 

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
      <div className="items-min-h-screen grid place-items-center p-6">
        {/* Administradores */}
        <div className="bg-white shadow-md rounded-2xl p-4 w-full max-w-2xl">
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
