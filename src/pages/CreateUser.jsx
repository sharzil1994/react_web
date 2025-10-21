// src/pages/CreateUser.jsx
import React, { useState } from 'react';
import { createUser } from '@/api/client'; // or '../api/client' if no '@' alias

export default function CreateUser(){
  // form fields
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPw, setShowPw]     = useState(false);

  // request state
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [result, setResult]     = useState(null);

  // Advanced: endpoint + mapping (tweak if Swagger uses different keys)
  const [endpoint, setEndpoint] = useState(import.meta.env.VITE_CREATE_USER_PATH || '/users/');
  const [keys, setKeys] = useState({
    username: 'username',
    email: 'email',
    password: 'password',
    full_name: 'full_name',   // change to `name` if your API expects `name`
  });

  function buildPayload(){
    // Build JSON exactly as your API expects
    return {
      [keys.username]: username,
      [keys.email]: email,
      [keys.password]: password,
      [keys.full_name]: fullName,
    };
  }

  async function onSubmit(e){
    e.preventDefault();
    setError(''); setResult(null);
    if (!username || !email || !password) { setError('Please fill username, email, and password.'); return; }

    try {
      setLoading(true);
      const data = await createUser(buildPayload(), endpoint);
      setResult(data);
      setUsername(''); setEmail(''); setPassword(''); setFullName('');
    } catch (err){
      const details = err?.data ? (typeof err.data === 'string' ? err.data : JSON.stringify(err.data, null, 2)) : '';
      setError(`${err.message}${details ? `\n${details}` : ''}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container">
      <h1>Create User</h1>
      <p className="subtitle">
        Posts to <code>{endpoint}</code> as defined in your Swagger (<em>create_user_users__post</em>).
        Use <strong>Advanced</strong> to adjust the path or field names if needed.
      </p>

      <form className="card" onSubmit={onSubmit} style={{display:'grid', gap:12, marginTop:12}}>
        <div style={{display:'grid', gap:6}}>
          <label>Username</label>
          <input className="btn" style={{padding:10}}
                 value={username} onChange={e=>setUsername(e.target.value)} placeholder="your_username" />
        </div>

        <div style={{display:'grid', gap:6}}>
          <label>Email</label>
          <input className="btn" style={{padding:10}} type="email"
                 value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <div style={{display:'grid', gap:6}}>
          <label>Password</label>
          <div style={{display:'flex', gap:8}}>
            <input className="btn" style={{padding:10, flex:1}}
                   type={showPw ? 'text' : 'password'} value={password}
                   onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
            <button type="button" className="btn" onClick={()=>setShowPw(s=>!s)}>{showPw ? 'Hide' : 'Show'}</button>
          </div>
        </div>

        <div style={{display:'grid', gap:6}}>
          <label>Full name (optional)</label>
          <input className="btn" style={{padding:10}}
                 value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your Name" />
        </div>

        <div style={{display:'flex', gap:10, marginTop:6}}>
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create user'}
          </button>
          <button type="button" className="btn" onClick={()=>{
            setUsername(''); setEmail(''); setPassword(''); setFullName(''); setError(''); setResult(null);
          }}>Reset</button>
        </div>

        <details style={{marginTop:6}}>
          <summary style={{cursor:'pointer', color:'var(--muted)'}}>Advanced (endpoint & field names)</summary>
          <div style={{display:'grid', gap:10, marginTop:10}}>
            <div style={{display:'grid', gap:6}}>
              <label>Endpoint path (relative to API base)</label>
              <input className="btn" style={{padding:10}} value={endpoint} onChange={e=>setEndpoint(e.target.value)} />
              <small style={{color:'var(--muted)'}}>
                Base = <code>{(import.meta.env.VITE_API_BASE || '/proxy')}</code> → Full URL:
                {' '}
                <code>
                  {`${(import.meta.env.VITE_API_BASE || '/proxy')}${endpoint.startsWith('/')?endpoint:`/${endpoint}`}`}
                </code>
              </small>
              <small style={{color:'var(--muted)'}}>Some servers require a trailing slash, e.g. <code>/users/</code>.</small>
            </div>

            <div className="card" style={{display:'grid', gap:6}}>
              <label>Field mapping (match your Swagger)</label>
              <div style={{display:'grid', gap:6}}>
                <div>username → <input className="btn" style={{padding:10}} value={keys.username} onChange={e=>setKeys(k=>({...k, username:e.target.value}))} /></div>
                <div>email → <input className="btn" style={{padding:10}} value={keys.email} onChange={e=>setKeys(k=>({...k, email:e.target.value}))} /></div>
                <div>password → <input className="btn" style={{padding:10}} value={keys.password} onChange={e=>setKeys(k=>({...k, password:e.target.value}))} /></div>
                <div>full name → <input className="btn" style={{padding:10}} value={keys.full_name} onChange={e=>setKeys(k=>({...k, full_name:e.target.value}))} /></div>
              </div>
            </div>
          </div>
        </details>
      </form>

      {error && <pre className="card" style={{whiteSpace:'pre-wrap', marginTop:12, color:'#fca5a5'}}>{error}</pre>}
      {result && (
        <div className="card" style={{marginTop:12}}>
          <h3>Response</h3>
          <pre style={{overflow:'auto', margin:0}}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
