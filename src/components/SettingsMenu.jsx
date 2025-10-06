// src/components/SettingsMenu.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * SettingsMenu
 * - Renders a fixed-position vertical panel at the RIGHT edge of the viewport
 * - Does NOT affect header layout (no reflow)
 * - Closes on outside click / Esc
 * - First 3 items: no-op; Last item: calls onLogout()
 */
export default function SettingsMenu({ onLogout }) {
  const [open, setOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(60); // pixels from top of page
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  // Compute a stable top position just under the navbar (or button) on open
  useLayoutEffect(() => {
    if (!open) return;
    let top = 60;
    const nav = document.querySelector(".navbar"); // your existing class
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

  // No-op menu actions
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
            right: 16,            // stick to rightmost; tweak if you want 0
            width: 200,
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 8px 28px rgba(0,0,0,.22)",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
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
