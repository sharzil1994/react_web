// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, tokenStorage } from '@/api/client'; // if no @ alias, use: ../api/client

export default function Login(){
  // form fields (UI)
  const [identifier, setIdentifier] = useState(''); // username or email
  const [password, setPassword]     = useState('');
  const [showPw, setShowPw]         = useState(false);

  // request/result state
  const [loading, setLoading]       = useState(false);
  const [error,   setError]         = useState('');
  const [result,  setResult]        = useState(null);
  const [savedToken, setSavedToken] = useState('');

  // Advanced config (server specifics)
  const [endpoint,   setEndpoint]   = useState(import.meta.env.VITE_LOGIN_PATH || '/api/login');
  const [userKey,    setUserKey]    = useState('username'); // or 'email'
  const [passKey,    setPassKey]    = useState('password');
  const [autoSaveKey,setAutoSaveKey]= useState('access_token'); // adjust if your API returns a different field

  const navigate = useNavigate();

  function buildPayload(){
    const p = {};
    p[userKey] = identifier;
    p[passKey] = password;
    return p;
  }

  async function onSubmit(e){
    e.preventDefault();
    setError(''); setResult(null); setSavedToken('');
    if (!identifier || !password) { setError('Please enter credentials.'); return; }

    try {
      setLoading(true);
      const data = await login(buildPayload(), endpoint);
      setResult(data);

      // Try to persist the token if present
      if (data && typeof data === 'object') {
        const token =
          data?.[autoSaveKey] ??
          data?.token ??
          data?.jwt ??
          data?.accessToken ??
          data?.access_token;

        if (token) {
          // ✅ write to both keys and notify the app
          tokenStorage.set(String(token));
          setSavedToken(String(token));
          window.dispatchEvent(new CustomEvent('auth:changed', { detail: { isAuthed: true } }));
          // Optional redirect to your MyPage area:
          // navigate('/mypage', { replace: true });
        }
      }
    } catch (err){
      const details = err?.data
        ? (typeof err.data === 'string' ? err.data : JSON.stringify(err.data, null, 2))
        : '';
      setError(`${err.message}${details ? `\n${details}` : ''}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container">
      <h1>Log in</h1>
      <p className="subtitle">
        Calls your API’s <code>POST {endpoint}</code>. Adjust field names in “Advanced” if needed.
      </p>

      <form className="h card" onSubmit={onSubmit} style={{display:'grid', gap:12, marginTop:12}}>
        <div style={{display:'grid', gap:6}}>
          <label>Username or Email</label>
          <input
            className="btn" style={{padding:10}}
            placeholder="your_username or you@example.com"
            value={identifier} onChange={e=>setAko(e.tke)}
          />
        </div>
        <div style={{display:'grid', gap:6}}>
          <label>Password</label>
          <div style={{display:'flex', gap:8}}>
            <input
              className="btn" style={{padding:10, flex:1}}
              type={showPw?'text':'password'} placeholder="••••••••"
              value={password} onChange={e=>setPassword(e.target.value)}
            />
            <button type="button" className="btn" onClick={()=>setShowPw(s=>!s)}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div style={{display:'flex', gap:10}}>
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Log in'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={()=>{
              setIdentifier(''); setPassword(''); setError(''); setResult(null); setSavedToken('');
            }}
          >
            Reset
          </button>
        </div>

        <details style={{marginTop:6}}>
          <summary style={{cursor:'pointer', color:'var(--muted)'}}>Advanced (Endpoint & field names)</summary>
          <div style={{display:'grid', gap:10, marginTop:10}}>
            <div style={{display:'grid', gap:6}}>
              <label>Endpoint path</label>
              <input className="btn" style={{padding:10}} value={endpoint} onChange={e=>setEndpoint(e.target.value)} />
              <small style={{color:'var(--muted)'}}>
                Base = <code>{(import.meta.env.VITE_API_BASE || '/proxy')}</code> → Full URL:
                {' '}<code>{`${(import.meta.env.VITE_API_BASE || '/proxy')}${endpoint.startsWith('/')?endpoint:`/${endpoint}`}`}</code>
              </small>
            </div>
            <div style={{display:'grid', gap:6}}>
              <label>Username/email field</label>
              <input className="btn" style={{padding:10}} value={userKey} onChange={e=>setUserKey(e.target.value)} />
            </div>
            <div style={{display:'grid', gap:6}}>
              <label>Password field</label>
              <input className="btn" style={{padding:10}} value={passKey} onChange={e=>setPassKey(e.target.value)} />
            </div>
            <div style={{display:'grid', gap:6}}>
              <label>Token key in response (auto-save)</label>
              <input className="btn" style={{padding:10}} value={autoSaveKey} onChange={e=>setAutoSaveKey(e.target.value)} />
            </div>
          </div>
        </details>
      </form>

      {savedToken && (
        <div className="card" style={{marginTop:12}}>
          <strong>Token saved:</strong> <code>{savedToken.slice(0,6)}…</code> in <code>localStorage</code>
        </div>
      )}

      {error && (
        <pre className="card" style={{whiteSpace:'pre-wrap', marginTop:12, color:'#fca5a5'}}>
          {error}
        </pre>
      )}

      {result && (
        <div className="card" style={{marginTop:12}}>
          <h3>Response</h3>
          <pre style={{overflow:'auto', margin:0}}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
