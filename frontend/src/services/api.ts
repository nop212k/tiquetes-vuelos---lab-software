// frontend/src/services/api.ts
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

export const getUsers = () => fetch(`${API_BASE}/users`).then(r => r.json());

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* Public flights */
export async function searchFlights(params: { origin?: string; destination?: string; date?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params.origin) qs.append("origin", params.origin);
  if (params.destination) qs.append("destination", params.destination);
  if (params.date) qs.append("date", params.date);
  if (params.page) qs.append("page", String(params.page || 1));
  if (params.limit) qs.append("limit", String(params.limit || 20));

  const res = await fetch(`${API_BASE}/flights?${qs.toString()}`);
  if (!res.ok) throw new Error(`Error buscando vuelos: ${res.status}`);
  return res.json();
}

export async function getFlight(id: number | string) {
  const res = await fetch(`${API_BASE}/flights/${id}`);
  if (!res.ok) throw new Error(`Error obteniendo vuelo: ${res.status}`);
  return res.json();
}

/* Admin flights */
export async function adminCreateFlight(payload: any) {
  const res = await fetch(`${API_BASE}/flights/admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Error creando vuelo: ${res.status}`);
  return res.json();
}

export async function adminListFlights(params: { page?: number; limit?: number; search?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.append("page", String(params.page));
  if (params.limit) qs.append("limit", String(params.limit));
  if (params.search) qs.append("search", params.search);
  const res = await fetch(`${API_BASE}/flights/admin?${qs.toString()}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Error listando vuelos: ${res.status}`);
  return res.json();
}

export async function adminGetFlight(id: number | string) {
  const res = await fetch(`${API_BASE}/flights/admin/${id}`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(`Error obteniendo vuelo admin: ${res.status}`);
  return res.json();
}

export async function adminUpdateFlight(id: number | string, payload: any) {
  const res = await fetch(`${API_BASE}/flights/admin/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Error actualizando vuelo: ${res.status}`);
  return res.json();
}

export async function adminDeleteFlight(id: number | string) {
  const res = await fetch(`${API_BASE}/flights/admin/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Error eliminando vuelo: ${res.status}`);
  return res.json();
}
