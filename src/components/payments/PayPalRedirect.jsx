import React, { useEffect, useState } from "react";
import { getPaypalPage } from "@/api/client";

export default function PayPalRedirect() {
  const [err, setErr] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    let gone = false;
    (async () => {
      try {
        const u = await getPaypalPage();
        if (gone) return;
        if (!u) throw new Error("Approval URL not provided by server");
        setUrl(u);
        // Redirect to PayPal approval URL
        window.location.href = u;
      } catch (e) {
        setErr(e?.message || "Failed to fetch PayPal page");
      }
    })();
    return () => { gone = true; };
  }, []);

  return (
    <div className="card" style={{ marginTop: 12 }}>
      {err ? <div style={{ color:"#fca5a5" }}>{err}</div> : <div>Redirecting to PayPal… {url}</div>}
    </div>
  );
}
