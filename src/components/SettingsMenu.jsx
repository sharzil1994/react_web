// src/components/SettingsMenu.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getPaypalPage } from "@/api/client"; // ✅ new import to fetch approval URL

/**
 * SettingsMenu
 * - Fixed panel at right edge (does not reflow header)
 * - Closes on outside click / Esc
 * - Adds "Pay with PayPal" which redirects to backend-provided approval URL
 */
export default function SettingsMenu({ onLogout }) {
  const [open, setOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(60);
  const [payBusy, setPayBusy] = useState(false);
  const [payErr, setPayErr] = useState("");

  const btnRef = useRef(null);
  const panelRef = useRef(null);

  // Compute a stable top position just under the navbar on open
  useLayoutEffect(() => {
    if (!open) return;
    let top = 60;
    const nav = document.querySelector(".navbar");
    if (nav) {
      const r = nav.getBoundingClientRect();
      top = r.bottom + window.scrollY + 8;
    } else if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      top = r.bottom + window.scrollY + 8;
    }
    setPanelTop(top);
  }, [open]);

  // Close on outside click / Esc
  useEffect(() => {
    function onDocClick(e) {
      const b = btnRef.current;
      const p = panelRef.current;
      if (!b || !p) return;
      if (b.contains(e.target) || p.contains(e.target)) return;
      setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function gotoPaypal() {
    try {
      setPayErr("");
      setPayBusy(true);
      // Ask backend for approval URL, then redirect
      const url = await getPaypalPage();
      if (!url) throw new Error("No approval URL returned from server.");
      // close menu and navigate
      setOpen(false);
      window.location.href = url;
    } catch (e) {
      setPayErr(e?.message || "Failed to open PayPal");
    } finally {
      setPayBusy(false);
    }
  }

  const noop = (e) => {
    e.preventDefault();
    setOpen(false);
  };

  return (
    <>
      {/* Trigger button stays in header; doesn't resize it */}
      <button
        id="settings-trigger"
        ref={btnRef}
        className="btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        title="Settings"
      >
        Settings ▾
      </button>

      {/* Fixed-position panel at right edge; doesn't affect layout */}
      {open && (
        <div
          ref={panelRef}
          role="menu"
          style={{
            position: "fixed",
            top: panelTop,
            right: 16,
            width: 220,
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 8px 28px rgba(0,0,0,.22)",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          {/* New: PayPal button */}
          <MenuItem
            label={payBusy ? "Opening PayPal…" : "Pay with PayPal"}
            onClick={gotoPaypal}
          />
          {/* Optional error line */}
          {payErr && (
            <div style={{ padding: "8px 12px", color: "#fca5a5", borderTop: "1px solid var(--border)" }}>
              {payErr}
            </div>
          )}

          {/* Existing items */}
          <MenuItem onClick={noop} label="Profile" />
          <MenuItem onClick={noop} label="Preferences" />
          <MenuItem onClick={noop} label="Billing" />
          <MenuItem
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
            label="Logout"
            danger
          />
        </div>
      )}
    </>
  );
}

function MenuItem({ label, onClick, danger }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: danger ? "#f87171" : "inherit",
      }}
      className="hover:bg-black/10"
    >
      {label}
    </button>
  );
}
