// src/components/BalancePanel.jsx
import React, { useEffect, useState } from "react";
import { fetchWalletMe } from "@/api/client"; // or "../api/client" if no '@' alias

const GAP = 8;          // gap between balance panel and the Settings button
const TOP_OFFSET = 1;  // should match Settings trigger's top

export default function BalancePanel() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null);
  const [err, setErr] = useState("");
  const [right, setRight] = useState(120);  // computed
  const [top, setTop] = useState(TOP_OFFSET);

  function computePosition() {
    const btn = document.getElementById("settings-trigger");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const btnWidth = rect.width || 92;      // safe default
    setRight(12 + btnWidth + GAP);          // Settings is fixed right:12 → panel sits to its left
    setTop(TOP_OFFSET);                     // align tops
  }

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const data = await fetchWalletMe();
      // common shapes
      const b =
        data?.balance ??
        data?.wallet?.balance ??
        data?.coins ??
        data?.points ??
        null;
      setBalance(b);
    } catch (e) {
      setErr(e.message || "Failed to load");
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    computePosition();
    load();

    const onAuth = (e) => {
      if (e?.detail?.isAuthed) load();
      else { setBalance(null); setErr(""); setLoading(false); }
      // position may change when nav appears/disappears
      setTimeout(computePosition, 0);
    };
    const onResize = () => computePosition();

    window.addEventListener("auth:changed", onAuth);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("auth:changed", onAuth);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        right,
        top,
        zIndex: 1999,
        padding: "8px 12px",
        minWidth: 120,
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderRadius: 12,
        // High-contrast dark pill
        background: "rgba(17, 24, 39, 0.96)",       // ~slate-900
        border: "1px solid rgba(148,163,184,.35)",   // ~slate-400/35
        color: "#F8FAFC",                             // ~slate-50
        boxShadow: "0 8px 28px rgba(0,0,0,.35)",
      }}
      title="Wallet balance"
    >
      <span style={{ opacity: 0.85, fontWeight: 700, fontSize: 13 }}>Balance</span>
      <span style={{ fontWeight: 800, fontSize: 14 }}>
        {loading ? "…" : err ? "—" : balance ?? "—"}
      </span>
    </div>
  );
}
