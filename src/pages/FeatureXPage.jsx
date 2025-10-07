// src/pages/FeatureXPage.jsx
import React, { useState } from "react";
import { callFeatureX } from "@/api/client"; // use '../api/client' if no alias

export default function FeatureXPage() {
  const [payload, setPayload] = useState(JSON.stringify({ input: "" }, null, 2));
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");

  async function submit(e){
    e.preventDefault();
    setErr(""); setRes(null);
    let body;
    try { body = JSON.parse(payload); } catch { setErr("Payload is not valid JSON"); return; }
    try {
      setLoading(true);
      const data = await callFeatureX(body);
      setRes(data);
    } catch (e) {
      setErr(e?.message || "Request failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="page-wrap">
      <h1>Services · Feature X</h1>
      <p className="subtitle">Frontend for the Feature X endpoint.</p>
      <form className="card" onSubmit={submit} style={{ display:"grid", gap:12 }}>
        <label>JSON payload</label>
        <textarea
          className="btn"
          rows={10}
          value={payload}
          onChange={(e)=>setPayload(e.target.value)}
          style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}
        />
        <div>
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send"}
          </button>
        </div>
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
