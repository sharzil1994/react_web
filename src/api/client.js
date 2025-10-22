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

const DEFAULT_FEATURE_X_PATH =
  (import.meta.env.VITE_FEATURE_X_PATH?.trim()) || '/api/feature-x';

const DEFAULT_FEATURE_Y_PATH =
  (import.meta.env.VITE_FEATURE_Y_PATH?.trim()) || '/api/feature-y';

const DEFAULT_PURESNET_PATH =
  (import.meta.env.VITE_PURESNET_PATH?.trim()) || '/api/puresnet';

// const DEFAULT_PAYPAL_CREATE_PATH =
//   (import.meta.env.VITE_PAYPAL_CREATE_PATH?.trim()) || "/api/paypal/create-order";
const DEFAULT_PAYPAL_CAPTURE_PATH =
  (import.meta.env.VITE_PAYPAL_CAPTURE_PATH?.trim()) || "/api/paypal/capture-order";
// const DEFAULT_PAYPAL_PAGE_PATH =
//   (import.meta.env.VITE_PAYPAL_PAGE_PATH?.trim())   || "/api/paypal";

function isAbsolute(u) { return /^https?:\/\//i.test(u); }

function extractFilenameFromCD(cd) {
  if (!cd) return null;
  // filename*=UTF-8''5urv.pdb OR filename="5urv.pdb"
  const m = /filename\*=UTF-8''([^;]+)|filename="?([^\";]+)"?/i.exec(cd);
  const raw = m?.[1] || m?.[2];
  try { return raw ? decodeURIComponent(raw) : null; } catch { return raw || null; }
}

export async function callPuresnetDownload(payload, endpointOverride) {
  const path = endpointOverride?.trim() || DEFAULT_PURESNET_PATH;
  const rel  = path.startsWith('/') ? path : `/${path}`;
  const url  = isAbsolute(rel) ? rel : `${API_BASE}${rel}`;

  const token = tokenStorage.get?.() || localStorage.getItem('authToken') || '';
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/octet-stream, chemical/x-pdb, */*',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });

  const ct = res.headers.get('content-type') || '';
  const cd = res.headers.get('content-disposition') || '';

  // If server returned JSON (error/details), surface it
  if (!res.ok || ct.includes('application/json')) {
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    const err = new Error(`HTTP ${res.status} ${res.statusText || ''}`.trim());
    err.data = data;
    throw err;
  }

  // Expect a binary PDB (chemical/x-pdb or octet-stream)
  const blob = await res.blob();
  const filename = extractFilenameFromCD(cd) || 'puresnet.pdb';

  // expose any useful headers (e.g., x-balance)
  const meta = {
    filename,
    contentType: ct,
    balance: res.headers.get('x-balance'),
    refId:   res.headers.get('x-ref-id'),
  };

  return { blob, meta };
}

export async function callFeatureX(payload, endpointOverride){
  return postJsonTo(endpointOverride?.trim() || DEFAULT_FEATURE_X_PATH, payload);
}
export async function callFeatureY(payload, endpointOverride){
  return postJsonTo(endpointOverride?.trim() || DEFAULT_FEATURE_Y_PATH, payload);
}

export const tokenStorage = {
  get()   { return localStorage.getItem('authToken') || ''; },
  set(t)  { if (t) localStorage.setItem('authToken', t); },
  clear() { localStorage.removeItem('authToken'); }
};

export async function createPaypalOrder(payload, endpointOverride) {
  return postJsonTo(endpointOverride?.trim() || DEFAULT_PAYPAL_CREATE_PATH, payload);
}
export async function capturePaypalOrder(orderID, endpointOverride) {
  // server expects { orderID }
  return postJsonTo(endpointOverride?.trim() || DEFAULT_PAYPAL_CAPTURE_PATH, { orderID });
}



async function postJsonTo(pathOrUrl, body){
  const rel = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  const url = /^https?:\/\//i.test(rel) ? rel : `${API_BASE}${rel}`;
  const token = tokenStorage.get();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { method:'POST', headers, body: JSON.stringify(body) });
  const text = await res.text();
  let data; try { data = JSON.parse(text) } catch { data = text; }
  if (!res.ok) { const err = new Error(`HTTP ${res.status} ${res.statusText}`); err.data = data; throw err; }
  return data;
}

export async function callPuresnet(payload, endpointOverride) {
  return postJsonTo(endpointOverride?.trim() || DEFAULT_PURESNET_PATH, payload);
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
  return postJsonTo(endpointOverride?.trim() || DEFAULT_CREATE_USER_PATH, payload);
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
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { headers });
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!res.ok || !ct.includes("application/json")) {
    const err = new Error(`HTTP ${res.status} ${res.statusText || ""}`.trim());
    err.data = text; // avoid wiping last good value on HTML/login pages
    throw err;
  }
  return JSON.parse(text);
}


// GET helper for the "paypal_page" endpoint.
// GET helper for the "paypal_page" endpoint (robust)
// Accepts: approval_url, url, redirect, href, or links[] with rel="approve"/"payer-action"
export async function getPaypalPage(endpointOverride) {
  const path = endpointOverride?.trim() || DEFAULT_PAYPAL_PAGE_PATH;
  const rel  = path.startsWith("/") ? path : `/${path}`;
  const url  = isAbsolute(rel) ? rel : `${API_BASE}${rel}`;

  const token = tokenStorage.get?.() || localStorage.getItem("authToken") || "";
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res  = await fetch(url, { headers });
  const ct   = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText || ""}`.trim());
    err.data = text; throw err;
  }

  // Try JSON first
  if (ct.includes("application/json")) {
    let data;
    try { data = JSON.parse(text); } catch { /* fall through */ }

    // direct fields
    const direct =
      data?.approval_url || data?.approvalUrl || data?.approvalLink ||
      data?.url || data?.redirect || data?.href ||
      data?.data?.approval_url || data?.result?.approval_url || data?.order?.approval_url;
    if (typeof direct === "string" && /^https?:\/\//i.test(direct)) return direct;

    // look for PayPal v2 links[] rel="approve"/"payer-action"
    const queue = [data];
    while (queue.length) {
      const cur = queue.shift();
      if (!cur || typeof cur !== "object") continue;
      if (Array.isArray(cur.links)) {
        const hit = cur.links.find(
          (l) => l && typeof l === "object" &&
                 typeof l.href === "string" &&
                 l.rel && /approve|payer-action/i.test(String(l.rel))
        );
        if (hit?.href) return hit.href;
      }
      for (const v of Object.values(cur)) if (v && typeof v === "object") queue.push(v);
    }
    return null;
  }

  // Plain text fallback (server returns URL as raw text)
  const trimmed = text.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}