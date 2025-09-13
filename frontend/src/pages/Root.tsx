// src/pages/Root.tsx
import { useState } from "react";

const Root = () => {
  // Datos de prueba mientras no haya backend
  const [clientes] = useState([
    { id: 1, nombre: "Juan Pérez", usuario: "juan123", correo: "juan@mail.com", fecha: "2024-01-12" },
    { id: 2, nombre: "Ana Torres", usuario: "anaT", correo: "ana@mail.com", fecha: "2024-02-05" }
  ]);

  const [admins] = useState([
    { id: 1, nombre: "Carlos Ruiz", usuario: "carlosAdmin", correo: "carlos@mail.com", fecha: "2024-03-20" }
  ]);

  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      {/* Clientes */}
      <div className="bg-white shadow-md rounded-2xl p-4">
        <h2 className="text-2xl font-bold mb-4 text-red-700">Clientes</h2>
        <ul>
          {clientes.map((c) => (
            <li key={c.id} className="flex justify-between items-center border-b py-2">
              <div className="text-black">
                <p>
                  <strong>{c.nombre}</strong> ({c.usuario})
                </p>
                <p>{c.correo} - {c.fecha}</p>
              </div>
              <div className="space-x-2">
                <button className="bg-blue-500 text-white px-2 py-1 rounded">Hacer admin</button>
                <button className="bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>
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
                  <strong>{a.nombre}</strong> ({a.usuario})
                </p>
                <p>{a.correo} - {a.fecha}</p>
              </div>
              <div className="space-x-2">
                <button className="bg-yellow-500 text-white px-2 py-1 rounded">Volver cliente</button>
                <button className="bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Root;




