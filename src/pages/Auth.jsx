// src/pages/Login.jsx
import React, { useState } from 'react';
// If '@' alias doesn't work in your project, use: ../api/client
import { login, createUser, logout, tokenStorage } from '@/api/client';

// —— Endpoints / field names from .env if present; safe defaults otherwise ——
const API_BASE              = (import.meta.env.VITE_API_BASE?.trim()) || '/proxy';
const LOGIN_ENDPOINT        = (import.meta.env.VITE_LOGIN_PATH?.trim()) || '/login';
const SIGNUP_ENDPOINT       = (import.meta.env.VITE_CREATE_USER_PATH?.trim()) || '/users/';

const LOGIN_USER_KEY        = (import.meta.env.VITE_LOGIN_USER_KEY?.trim()) || 'username'; // or 'email'
const LOGIN_PASS_KEY        = (import.meta.env.VITE_LOGIN_PASS_KEY?.trim()) || 'password';

const SIGNUP_USERNAME_KEY   = (import.meta.env.VITE_SIGNUP_USERNAME_KEY?.trim()) || 'username';
const SIGNUP_EMAIL_KEY      = (import.meta.env.VITE_SIGNUP_EMAIL_KEY?.trim()) || 'email';
const SIGNUP_PASSWORD_KEY   = (import.meta.env.VITE_SIGNUP_PASSWORD_KEY?.trim()) || 'password';
const SIGNUP_FULLNAME_KEY   = (import.meta.env.VITE_SIGNUP_FULLNAME_KEY?.trim()) || 'full_name';

const TOKEN_KEY_IN_RESPONSE = (import.meta.env.VITE_TOKEN_KEY?.trim()) || 'access_token';

export default function Login(){
  const [tab, setTab]     = useState('login');            // 'login' | 'signup'
  const [isAuthed, setIsAuthed] = useState(!!tokenStorage.get());
  const [infoMsg, setInfoMsg]   = useState('');

  // LOGIN state
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError,   setLoginError]   = useState('');
  const [loginResult,  setLoginResult]  = useState(null);
  const [savedToken,   setSavedToken]   = useState('');

  // SIGNUP state
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [signupPw, setSignupPw] = useState('');
  const [fullName, setFullName] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError,   setSignupError]   = useState('');
  const [signupResult,  setSignupResult]  = useState(null);

  // helpers
  function buildLoginPayload(){
    return { [LOGIN_USER_KEY]: identifier, [LOGIN_PASS_KEY]: password };
  }
  function buildSignupPayload(){
    return {
      [SIGNUP_USERNAME_KEY]: username,
      [SIGNUP_EMAIL_KEY]:    email,
      [SIGNUP_PASSWORD_KEY]: signupPw,
      [SIGNUP_FULLNAME_KEY]: fullName,
    };
  }

  // submit handlers
  async function submitLogin(e){
    e.preventDefault();
    setLoginError(''); setLoginResult(null); setSavedToken(''); setInfoMsg('');
    if (!identifier || !password) { setLoginError('Please enter credentials.'); return; }

    try {
      setLoginLoading(true);
      const data = await login(buildLoginPayload()); // form-encoded in client.js
      setLoginResult(data);

      const token = data?.[TOKEN_KEY_IN_RESPONSE] || data?.token || data?.jwt || data?.access_token || data?.accessToken;
      if (token) {
        tokenStorage.set(token);
        setSavedToken(token);
        setIsAuthed(true);                 // ✅ logged in
        setInfoMsg('Token saved to localStorage.authToken');
      }
    } catch (err){
      const details = err?.data ? (typeof err.data === 'string' ? err.data : JSON.stringify(err.data, null, 2)) : '';
      setLoginError(`${err.message}${details ? `\n${details}` : ''}`);
    } finally { setLoginLoading(false); }
  }

  async function submitSignup(e){
    e.preventDefault();
    setSignupError(''); setSignupResult(null); setInfoMsg('');
    if (!username || !email || !signupPw) { setSignupError('Please fill username, email, and password.'); return; }

    try {
      setSignupLoading(true);
      const data = await createUser(buildSignupPayload()); // JSON in client.js
      setSignupResult(data);
      // keep user on signup tab; you can auto-switch to login if desired:
      // setTab('login');
      setUsername(''); setEmail(''); setSignupPw(''); setFullName('');
    } catch (err){
      const details = err?.data ? (typeof err.data === 'string' ? err.data : JSON.stringify(err.data, null, 2)) : '';
      setSignupError(`${err.message}${details ? `\n${details}` : ''}`);
    } finally { setSignupLoading(false); }
  }

  // logout: clear token + reset all UI to initial state
  async function handleLogout(){
    await logout();                       // optional server call + clear local token
    // reset everything back to initial
    setIsAuthed(false);
    setTab('login');
    setInfoMsg('Logged out (token cleared).');

    setIdentifier(''); setPassword(''); setShowPw(false);
    setLoginLoading(false); setLoginError(''); setLoginResult(null); setSavedToken('');

    setUsername(''); setEmail(''); setSignupPw(''); setFullName('');
    setSignupLoading(false); setSignupError(''); setSignupResult(null);
  }

  return (
    <section className="container">
      <div className="hero" style={{paddingBottom:16}}>
        <div className="kicker">auth</div>
        <h1>{isAuthed ? 'Welcome' : (tab === 'login' ? 'Log in' : 'Create account')}</h1>
        <p className="subtitle">
          This page sends POST requests to your API. Endpoints/fields are configured in <code>.env</code>.
        </p>
        <div className="cta-row">
          {!isAuthed && (
            <>
              <button className={'btn' + (tab==='login' ? ' primary' : '')} onClick={()=>setTab('login')}>Login</button>
              <button className={'btn' + (tab==='signup'? ' primary' : '')} onClick={()=>setTab('signup')}>Sign up</button>
            </>
          )}
          {isAuthed && (
            <button className="btn" onClick={handleLogout}>Logout</button>
          )}
        </div>
      </div>

      {infoMsg && <div className="card" style={{marginTop:12}}>{infoMsg}</div>}

      {/* If logged in, hide both forms */}
      {!isAuthed && (
        <>
          {/* LOGIN */}
          {tab === 'login' && (
            <>
              <form className="card" onSubmit={submitLogin} style={{display:'grid', gap:12}}>
                <div style={{display:'grid', gap:6}}>
                  <label>Username or Email</label>
                  <input className="btn" style={{padding:10}} value={identifier} onChange={e=>setIdentifier(e.target.value)} />
                </div>
                <div style={{display:'grid', gap:6}}>
                  <label>Password</label>
                  <div style={{display:'flex', gap:8}}>
                    <input className="btn" style={{padding:10, flex:1}} type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} />
                    <button type="button" className="btn" onClick={()=>setShowPw(s=>!s)}>{showPw?'Hide':'Show'}</button>
                  </div>
                </div>
                <div style={{display:'flex', gap:10}}>
                  <button className="btn primary" type="submit" disabled={loginLoading}>
                    {loginLoading ? 'Signing in…' : 'Log in'}
                  </button>
                  {/* ❌ no Reset button */}
                </div>
              </form>

              {loginError  && <pre className="card" style={{whiteSpace:'pre-wrap', marginTop:12, color:'#fca5a5'}}>{loginError}</pre>}
              {loginResult && <div className="card" style={{marginTop:12}}><h3>Response</h3><pre style={{overflow:'auto', margin:0}}>{JSON.stringify(loginResult,null,2)}</pre></div>}
            </>
          )}

          {/* SIGN UP */}
          {tab === 'signup' && (
            <>
              <form className="card" onSubmit={submitSignup} style={{display:'grid', gap:12}}>
                <div style={{display:'grid', gap:6}}>
                  <label>Username</label>
                  <input className="btn" style={{padding:10}} value={username} onChange={e=>setUsername(e.target.value)} placeholder="your_username" />
                </div>
                <div style={{display:'grid', gap:6}}>
                  <label>Email</label>
                  <input className="btn" style={{padding:10}} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div style={{display:'grid', gap:6}}>
                  <label>Password</label>
                  <input className="btn" style={{padding:10}} type="password" value={signupPw} onChange={e=>setSignupPw(e.target.value)} placeholder="••••••••" />
                </div>
                <div style={{display:'grid', gap:6}}>
                  <label>Full name (optional)</label>
                  <input className="btn" style={{padding:10}} value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your Name" />
                </div>
                <div style={{display:'flex', gap:10}}>
                  <button className="btn primary" type="submit" disabled={signupLoading}>
                    {signupLoading ? 'Creating…' : 'Create user'}
                  </button>
                  {/* ❌ no Reset button */}
                </div>
              </form>

              {signupError  && <pre className="card" style={{whiteSpace:'pre-wrap', marginTop:12, color:'#fca5a5'}}>{signupError}</pre>}
              {signupResult && <div className="card" style={{marginTop:12}}><h3>Response</h3><pre style={{overflow:'auto', margin:0}}>{JSON.stringify(signupResult,null,2)}</pre></div>}
            </>
          )}
        </>
      )}

      {/* When logged in, you could show a simple card */}
      {isAuthed && (
        <div className="card" style={{marginTop:12}}>
          <strong>You are logged in.</strong>
          <div style={{marginTop:6, color:'var(--muted)'}}>Use the Logout button above to end the session.</div>
        </div>
      )}
    </section>
  );
}
