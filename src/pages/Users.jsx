import React, { useState } from 'react'
import { createUser } from '@/api/client'

export default function Users(){
  const [endpoint, setEndpoint] = useState(import.meta.env.VITE_CREATE_USER_PATH || '/api/users')
  const [token, setToken] = useState(localStorage.getItem('authToken') || '')
  const [payload, setPayload] = useState(JSON.stringify({
    username: '',
    email: '',
    password: '',
    full_name: ''
  }, null, 2))

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function saveToken(){
    localStorage.setItem('authToken', token)
    alert('Token saved. It will be used on requests as: Authorization: Bearer <token>')
  }

  async function onSubmit(e){
    e.preventDefault()
    setLoading(true); setError(''); setResult(null)
    try {
      let body
      try { body = JSON.parse(payload) } catch {
        throw new Error('Payload is not valid JSON.')
      }
      const data = await createUser(body, endpoint)
      setResult(data)
    } catch (err){
      setError(err.message + (err.data ? `\n${JSON.stringify(err.data, null, 2)}` : ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container">
      <h1>Create User</h1>
      <p>Fill the JSON payload and submit. Adjust the endpoint path to match your Swagger (e.g. <code>/api/users</code> or <code>/users/</code>). During dev, calls go through the Vite proxy (<code>VITE_API_BASE=/proxy</code>).</p>

      <div className="card" style={{marginTop:12}}>
        <form onSubmit={onSubmit} style={{display:'grid', gap:12}}>
          <div style={{display:'grid', gap:8}}>
            <label>Endpoint path (relative to API base)</label>
            <input className="btn" style={{padding:10}} value={endpoint} onChange={e=>setEndpoint(e.target.value)} />
            <small style={{color:'var(--muted)'}}>Base = <code>{import.meta.env.VITE_API_BASE || ''}</code> → Full URL sent: <code>{(import.meta.env.VITE_API_BASE || '') + endpoint}</code></small>
          </div>

          <div style={{display:'grid', gap:8}}>
            <label>Bearer token (optional)</label>
            <div style={{display:'flex', gap:8}}>
              <input className="btn" style={{padding:10, flex:1}} placeholder="paste token if required" value={token} onChange={e=>setToken(e.target.value)} />
              <button type="button" className="btn" onClick={saveToken}>Save</button>
            </div>
          </div>

          <div style={{display:'grid', gap:8}}>
            <label>JSON payload</label>
            <textarea className="btn" rows="10" value={payload} onChange={e=>setPayload(e.target.value)} />
          </div>

          <div style={{display:'flex', gap:8}}>
            <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create user'}</button>
            <button className="btn" type="button" onClick={()=>setPayload(JSON.stringify({username:'',email:'',password:'',full_name:''}, null, 2))}>Reset payload</button>
          </div>
        </form>
      </div>

      {error && <pre className="card" style={{whiteSpace:'pre-wrap', marginTop:12, color:'#fca5a5'}}>{error}</pre>}
      {result && (
        <div className="card" style={{marginTop:12}}>
          <h3>Response</h3>
          <pre style={{overflow:'auto'}}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </section>
  )
}
