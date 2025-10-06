const API_BASE = import.meta.env.VITE_API_BASE || '';
const DEFAULT_CREATE_USER_PATH = import.meta.env.VITE_CREATE_USER_PATH || '/api/users';

export function getAuthHeaders(){
  const token = localStorage.getItem('authToken') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createUser(payload, endpointOverride){
  const path = endpointOverride && endpointOverride.trim() ? endpointOverride : DEFAULT_CREATE_USER_PATH;
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText}`);
    err.status = res.status; err.data = data; throw err;
  }
  return data;
}
