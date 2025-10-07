import React, { useState } from "react";
import { callPuresnet } from "@/api/client";

export default function PuresnetPage() {
  const [input, setInput]     = useState("");       // change label to what your API expects
  const [loading, setLoading] = useState(false);
  const [res, setRes]         = useState(null);
  const [err, setErr]         = useState("");

  async function usePuresnet(e){
    e.preventDefault();
    setErr(""); setRes(null);
    try {
      setLoading(true);
      // Common: { input: string } — adjust to your Swagger if needed
      const payload = { input };
      const data = await callPuresnet(payload);
      setRes(data);
      window.dispatchEvent(new Event("wallet:changed")); // refresh balance if it changes
    } catch (e) {
      setErr(e?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrap">
      <h1>PureSNet</h1>
      <p className="subtitle">Run the PureSNet feature.</p>

      <form className="card" onSubmit={usePuresnet} style={{ display:"grid", gap:12 }}>
        <label>Input</label>
        <input
          className="btn"
          style={{ padding: 10 }}
          placeholder="Enter input"
          value={input}
          onChange={(e)=>setInput(e.target.value)}
        />
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? "Running…" : "Run PureSNet"}
        </button>
      </form>

      {err && <pre className="card" style={{ whiteSpace:"pre-wrap", color:"#fca5a5", marginTop:12 }}>{err}</pre>}
      {res && (
        <div className="card" style={{ marginTop:12 }}>
          <h3>Response</h3>
          <pre style={{ overflow:"auto", margin:0 }}>{JSON.stringify(res, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
