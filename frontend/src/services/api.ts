// frontend/src/services/api.ts
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export const getUsers = () => fetch(`${API_BASE}/api/users`).then(r => r.json());

function authHeaders(): Record<string, string>  {
  const token = localStorage.getItem("token");
  console.log('Token para autenticación:', token ? 'Presente' : 'No encontrado');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse(res: Response) {
  let data: any = null;
  try { 
    data = await res.json(); 
  } catch (e) { 
    console.error('Error al parsear respuesta JSON:', e);
  }

  if (!res.ok) {
    const message = data?.message || `HTTP ${res.status}`;
    const details = data?.details || null;
    console.error(`Error en respuesta API: ${message}`, details);
    const error: any = new Error(message);
    error.status = res.status;
    error.details = details;
    throw error;
  }
  return data;
}

/* Auth */
export async function postLogin(payload: { login: string; password: string }) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse(res);
}

export async function postRegister(payload: any) {
  const res = await fetch(`${API_BASE}/api/users/register`, {
    method: "POST",
    // si envías form-data (foto), no pongas Content-Type aquí
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse(res);
}

/* Public flights */
export async function searchFlights(params: { origin?: string; destination?: string; date?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params.origin) qs.append("origin", params.origin);
  if (params.destination) qs.append("destination", params.destination);
  if (params.date) qs.append("date", params.date);
  if (params.page) qs.append("page", String(params.page || 1));
  if (params.limit) qs.append("limit", String(params.limit || 20));

  const res = await fetch(`${API_BASE}/api/flights?${qs.toString()}`);
  if (!res.ok) throw new Error(`Error buscando vuelos: ${res.status}`);
  return res.json();
}

export async function getFlight(id: number | string) {
  const res = await fetch(`${API_BASE}/api/flights/${id}`);
  if (!res.ok) throw new Error(`Error obteniendo vuelo: ${res.status}`);
  return res.json();
}

/* GET current user */
export async function getMe() {
  console.log(`Haciendo petición a ${API_BASE}/api/users/me`);
  try {
    const headers = authHeaders();
    console.log('Headers de autenticación:', headers);
    
    const res = await fetch(`${API_BASE}/api/users/me`, {
      headers: { ...headers }
    });
    
    console.log('Respuesta del servidor:', res.status, res.statusText);
    
    if (!res.ok) {
      const errorData = await res.text();
      console.error('Error en getMe:', res.status, errorData);
      throw new Error(`No autorizado: ${res.status} - ${errorData || res.statusText}`);
    }
    
    const data = await res.json();
    console.log('Datos del usuario:', data);
    return data;
  } catch (error) {
    console.error('Error en getMe:', error);
    throw error;
  }
}

/* Admin flights */
export async function adminListFlights(params: { page?: number; limit?: number; search?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.append("page", String(params.page));
  if (params.limit) qs.append("limit", String(params.limit));
  if (params.search) qs.append("search", params.search);
  const res = await fetch(`${API_BASE}/api/flights/admin?${qs.toString()}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Error listando vuelos: ${res.status}`);
  return res.json();
}

export async function adminCreateFlight(payload: any) {
  const res = await fetch(`${API_BASE}/api/flights/admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Error creando vuelo: ${res.status}`);
  return res.json();
}

export async function adminGetFlight(id: number | string) {
  const res = await fetch(`${API_BASE}/api/flights/admin/${id}`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(`Error obteniendo vuelo admin: ${res.status}`);
  return res.json();
}

export async function adminUpdateFlight(id: number | string, payload: any) {
  const res = await fetch(`${API_BASE}/api/flights/admin/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Error actualizando vuelo: ${res.status}`);
  return res.json();
}

export async function adminDeleteFlight(id: number | string) {
  const res = await fetch(`${API_BASE}/api/flights/admin/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Error eliminando vuelo: ${res.status}`);
  return res.json();
}
