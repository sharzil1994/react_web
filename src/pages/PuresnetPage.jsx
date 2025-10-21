import React, { useState } from "react";
import { callPuresnetDownload } from "@/api/client"; // NEW helper

export default function PuresnetPage() {
  // Form fields (what Swagger shows)
  const [proteinId, setProteinId] = useState(""); // -> req.protein
  const [chain, setChain]         = useState(""); // -> req.mode
  const [reason, setReason]       = useState(""); // optional reason

  // UI state
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState("");
  const [fileReady, setFileReady] = useState(false);
  const [fileUrl, setFileUrl]   = useState("");
  const [fileName, setFileName] = useState("puresnet.pdb");

  function validate() {
    if (!proteinId.trim()) { setErr("Protein ID is required."); return false; }
    if (!chain.trim())     { setErr("Chain is required.");      return false; }
    return true;
  }

  async function runPuresnet(e){
    e?.preventDefault?.();
    setErr("");
    setFileReady(false);
    if (!validate()) return;

    try {
      setLoading(true);
      // EXACT body from Swagger:
      // {
      //   "req": { "protein": "<id>", "mode": "<chain>", "save_dir": "string" },
      //   "reason": "Generate PDB from PUResNet"
      // }
      const payload = {
        req: {
          protein: proteinId.trim(),
          mode:    chain.trim(),
          // save_dir is shown in Swagger; backend likely ignores it on our side:
          save_dir: "string"
        },
        reason: reason || "Generate PDB from PUResNet"
      };

      const { blob, meta } = await callPuresnetDownload(payload);
      // create a blob URL for "Download file" button
      const url = URL.createObjectURL(blob);
      setFileUrl(url);
      setFileName(meta?.filename || "puresnet.pdb");
      setFileReady(true);

      // optional: if x-balance header present, ask balance pill to refresh immediately
      window.dispatchEvent(new Event("wallet:changed"));
    } catch (e) {
      const msg = e?.data
        ? (typeof e.data === "string" ? e.data : JSON.stringify(e.data, null, 2))
        : (e?.message || "Request failed");
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  function downloadNow() {
    if (!fileUrl) return;
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName || "puresnet.pdb";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="page-wrap">
      <h1>PUResNet — Generate PDB</h1>
      <p className="subtitle">Enter <b>Protein ID</b> and <b>Chain</b>. The server returns a PDB file for download.</p>

      <form className="card" onSubmit={runPuresnet} style={{ display:"grid", gap:12 }}>
        <div style={{ display:"grid", gap:6 }}>
          <label>Protein ID <span style={{color:"#fca5a5"}}>*</span></label>
          <input
            className="btn" style={{ padding:10 }}
            placeholder="e.g. 5urv"
            value={proteinId}
            onChange={(e)=>setProteinId(e.target.value)}
          />
        </div>

        <div style={{ display:"grid", gap:6 }}>
          <label>Chain <span style={{color:"#fca5a5"}}>*</span></label>
          <input
            className="btn" style={{ padding:10 }}
            placeholder="e.g. A"
            value={chain}
            onChange={(e)=>setChain(e.target.value)}
          />
        </div>

        <div style={{ display:"grid", gap:6 }}>
          <label>Reason (optional)</label>
          <input
            className="btn" style={{ padding:10 }}
            placeholder="Generate PDB from PUResNet"
            value={reason}
            onChange={(e)=>setReason(e.target.value)}
          />
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Generating…" : "Run PUResNet"}
          </button>

          {/* Show ONLY after success */}
          {fileReady && !loading && (
            <button className="btn" type="button" onClick={downloadNow}>
              Download file
            </button>
          )}
        </div>
      </form>

      {err && (
        <pre className="card" style={{ whiteSpace:"pre-wrap", color:"#fca5a5", marginTop:12 }}>
{err}
        </pre>
      )}

      {/* Optionally show filename/info when ready */}
      {fileReady && (
        <div className="card" style={{ marginTop:12 }}>
          <strong>Ready:</strong> {fileName}
        </div>
      )}
    </div>
  );
}
