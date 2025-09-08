const API_BASE = 'http://localhost:8000/api';

export const getUsers = () => fetch(`${API_BASE}/users`);