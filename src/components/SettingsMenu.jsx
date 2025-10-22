import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function SettingsMenu({ onLogout }) {
  const [open, setOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(60);
  const btnRef = useRef(null);
  const panelRef = useRef(null);

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

  useEffect(() => {
    function onDocClick(e) {
      const b = btnRef.current, p = panelRef.current;
      if (!b || !p) return;
      if (b.contains(e.target) || p.contains(e.target)) return;
      setOpen(false);
    }
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      <button
        id="settings-trigger"
        ref={btnRef}
        className="btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        title="Settings"
      >
        Settings ▾
      </button>

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
          {/* ✅ New: just navigate to /paypal */}
          <MenuItem
            label="Pay with PayPal"
            onClick={() => { setOpen(false); window.location.href = "/paypal"; }}
          />

          {/* existing items */}
          <MenuItem onClick={() => setOpen(false)} label="Profile" />
          <MenuItem onClick={() => setOpen(false)} label="Preferences" />
          <MenuItem onClick={() => setOpen(false)} label="Billing" />
          <MenuItem
            onClick={() => { setOpen(false); onLogout?.(); }}
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
