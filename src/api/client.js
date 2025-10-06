// src/api/client.js
const API_BASE =
  (import.meta.env.VITE_API_BASE?.trim()) || '/proxy';

const DEFAULT_LOGIN_PATH =
  (import.meta.env.VITE_LOGIN_PATH?.trim()) || '/login';

const DEFAULT_CREATE_USER_PATH =
  (import.meta.env.VITE_CREATE_USER_PATH?.trim()) || '/users/';

const LOGOUT_PATH =
  (import.meta.env.VITE_LOGOUT_PATH?.trim()) || ''; // optional

const DEFAULT_WALLET_ME_PATH =
  (import.meta.env.VITE_WALLET_ME_PATH?.trim()) || "/api/wallet/me";

function isAbsolute(u) { return /^https?:\/\//i.test(u); }

export const tokenStorage = {
  get()   { return localStorage.getItem('authToken') || ''; },
  set(t)  { if (t) localStorage.setItem('authToken', t); },
  clear() { localStorage.removeItem('authToken'); }
};

async function postJson(pathOrUrl, body) {
  const rel = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  const url = isAbsolute(rel) ? rel : `${API_BASE}${rel}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text) } catch { data = text; }
  if (!res.ok) { const err = new Error(`HTTP ${res.status} ${res.statusText}`); err.data = data; throw err; }
  return data;
}

// login as form-url-encoded (FastAPI/OAuth style)
export async function login(payload, endpointOverride) {
  const rel = (endpointOverride?.trim()) || DEFAULT_LOGIN_PATH;
  const url = isAbsolute(rel) ? rel : `${API_BASE}${rel}`;
  const form = new URLSearchParams();
  for (const [k, v] of Object.entries(payload)) form.append(k, v ?? '');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text) } catch { data = text; }
  if (!res.ok) { const err = new Error(`HTTP ${res.status} ${res.statusText}`); err.data = data; throw err; }
  return data;
}

// sign-up stays JSON
export async function createUser(payload, endpointOverride) {
  return postJson(endpointOverride?.trim() || DEFAULT_CREATE_USER_PATH, payload);
}

// optional server logout; always clears local token
export async function logout() {
  const token = tokenStorage.get();
  try {
    if (LOGOUT_PATH) {
      const rel = LOGOUT_PATH.startsWith('/') ? LOGOUT_PATH : `/${LOGOUT_PATH}`;
      const url = isAbsolute(rel) ? rel : `${API_BASE}${rel}`;
      await fetch(url, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }).catch(() => {}); // ignore network errors for local logout
    }
  } finally {
    tokenStorage.clear();
  }
}
export async function doGlobalLogout() {
  // call server logout (if VITE_LOGOUT_PATH is set) and always clear token
  await logout();

  // tell the whole app "auth changed" + ask screens to reset UI
  window.dispatchEvent(new CustomEvent('auth:changed', { detail: { isAuthed: false } }));
  window.dispatchEvent(new Event('auth:reset'));
}

export async function fetchWalletMe() {
  const rel = DEFAULT_WALLET_ME_PATH.startsWith("/")
    ? DEFAULT_WALLET_ME_PATH
    : `/${DEFAULT_WALLET_ME_PATH}`;
  const url = isAbsolute(rel) ? rel : `${API_BASE}${rel}`;

  const token = tokenStorage.get();
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  const res = await fetch(url, { headers });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText}`);
    err.data = data;
    throw err;
  }
  return data; // expect { balance: ... } or similar
}