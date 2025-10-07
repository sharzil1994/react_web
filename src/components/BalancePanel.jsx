import React, { useEffect, useRef, useState } from "react";
import { fetchWalletMe } from "@/api/client";

// Positioning (same as yours)
const GAP = 8;
const TOP_OFFSET = 1;
// Poll interval (ms) — falls back to 10s
const REFRESH_MS = Math.max(3000, Number(import.meta.env.VITE_WALLET_REFRESH_MS || "10000"));

// Support a custom key via .env, strip accidental quotes
const RAW_KEY = (import.meta.env.VITE_WALLET_BALANCE_KEY || "").trim();
const BAL_KEY = RAW_KEY.replace(/^['"]|['"]$/g, "");

// Helpers
function getByPath(obj, path) {
  return path.split(".").reduce((acc, p) => (acc && typeof acc === "object" ? acc[p] : undefined), obj);
}

// Robust extractor: prefer env key → common keys → deep scan favouring *_balance/coins/points
function extractBalance(data) {
  if (!data || typeof data !== "object") return null;

  if (BAL_KEY) {
    const v = getByPath(data, BAL_KEY);
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n)) return n;
  }

  const cands = [data?.balance, data?.wallet?.balance, data?.coins, data?.points];
  for (const v of cands) {
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n)) return n;
  }

  // Deep scan for likely keys
  const queue = [data];
  while (queue.length) {
    const obj = queue.shift();
    if (!obj || typeof obj !== "object") continue;
    for (const [k, v] of Object.entries(obj)) {
      if (v && typeof v === "object") queue.push(v);
      const n = typeof v === "number" ? v : Number(v);
      if (Number.isFinite(n)) {
        if (/(balance|coin|coins|point|points)$/i.test(k)) return n;
      }
    }
  }
  return null;
}

export default function BalancePanel() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null);      // last GOOD value (never blanked by errors)
  const [err, setErr] = useState("");
  const [right, setRight] = useState(120);
  const [top, setTop] = useState(TOP_OFFSET);

  const firstLoaded = useRef(false);
  const aliveRef = useRef(true);
  const fetchingRef = useRef(false);
  const timerRef = useRef(null);

  function computePosition() {
    const btn = document.getElementById("settings-trigger");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const btnWidth = rect.width || 92;
    setRight(12 + btnWidth + GAP);
    setTop(TOP_OFFSET);
  }

  async function loadOnce() {
    if (!aliveRef.current || fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      if (!firstLoaded.current) setLoading(true);
      setErr("");

      const data = await fetchWalletMe();         // strict JSON now
      if (!aliveRef.current) return;

      const b = extractBalance(data);
      if (b != null) {
        setBalance(b);                            // ✅ keep good value
      } else {
        setErr("No balance field");
      }
    } catch (e) {
      if (!aliveRef.current) return;
      setErr(e?.message || "Failed to load");     // ✅ do NOT clear last good value
    } finally {
      if (!aliveRef.current) return;
      firstLoaded.current = true;
      setLoading(false);
      fetchingRef.current = false;
      // single-loop schedule (StrictMode-safe)
      timerRef.current = window.setTimeout(() => {
        if (!document.hidden) loadOnce();
      }, REFRESH_MS);
    }
  }

  function startLoop() {
    stopLoop();
    loadOnce();                                   // immediate
  }
  function stopLoop() {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    fetchingRef.current = false;
  }

  useEffect(() => {
    aliveRef.current = true;
    computePosition();
    startLoop();

    const onVis = () => { if (!document.hidden) loadOnce(); };
    const onResize = () => computePosition();
    const onWallet = () => loadOnce?.();
    const onAuth = (e) => {
      if (e?.detail?.isAuthed) startLoop();      // restart when logging in
      else {
        stopLoop();                               // stop + clear when logging out
        firstLoaded.current = false;
        setLoading(false);
        setBalance(null);
        setErr("");
      }
      setTimeout(computePosition, 0);
    };
    

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", onResize);
    window.addEventListener("auth:changed", onAuth);

    return () => {
      aliveRef.current = false;
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("auth:changed", onAuth);
      stopLoop();
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
        background: "rgba(17, 24, 39, 0.96)",
        border: "1px solid rgba(148,163,184,.35)",
        color: "#F8FAFC",
        boxShadow: "0 8px 28px rgba(0,0,0,.35)",
      }}
      title={err ? `Last error: ${err}` : "Wallet balance"}
    >
      <span style={{ opacity: 0.85, fontWeight: 700, fontSize: 13 }}>Balance</span>
      <span style={{ fontWeight: 800, fontSize: 14 }}>
        {!firstLoaded.current ? "…" : balance ?? "—"}
      </span>
    </div>
  );
}
