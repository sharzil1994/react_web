// src/components/LeftSidebar.jsx
import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function LeftSidebar({ collapsed, onToggle, fixed = false, top = 72 }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [flyPos, setFlyPos] = useState({ top: top + 8, left: 240 });
  const btnRef = useRef(null);
  const panelRef = useRef(null); // ✅ capture clicks inside flyout

  const isServicesSection = location.pathname.startsWith("/mypage/services");

  // Close the flyout if the route changes
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Close only on true outside clicks (use 'click', not 'mousedown')
  useEffect(() => {
    function onDocClick(e) {
      if (!open) return;
      const btn = btnRef.current;
      const panel = panelRef.current;
      if ((btn && btn.contains(e.target)) || (panel && panel.contains(e.target))) return;
      setOpen(false);
    }
    function onKey(e) { if (e.key === "Escape") setOpen(false); }

    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggleFlyout() {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setFlyPos({ top: r.top + window.scrollY, left: r.right + 8 });
    setOpen(o => !o);
  }

  const Item = ({ to, label, k }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "side-item" + (isActive ? " active" : "") + (collapsed ? " collapsed" : "")
      }
    >
      <span className="side-icon">{k}</span>
      {!collapsed && <span className="side-label">{label}</span>}
    </NavLink>
  );

  const baseClass = "sidebar" + (collapsed ? " collapsed" : "");
  const cls = fixed ? baseClass + " sidebar-fixed" : baseClass;
  const style = fixed
    ? {
        position: "fixed",
        left: 0,
        top,
        height: `calc(100vh - ${top}px)`,
        width: collapsed ? 64 : 220,
        background: "var(--panel)",
        padding: 8,
        borderRight: "1px solid var(--border)",
        borderRadius: "0 12px 12px 0",
        zIndex: 1000,
      }
    : undefined;

  return (
    <>
      <aside className={cls} style={style}>
        <div className="side-header">
          {!collapsed && <div className="side-title">My Page</div>}
          <button className="side-toggle" onClick={onToggle} title={collapsed ? "Expand" : "Collapse"}>
            {collapsed ? "»" : "«"}
          </button>
        </div>

        <nav className="side-nav">
          {/* Services trigger = button with flyout */}
          <button
            ref={btnRef}
            type="button"
            className={
              "side-item" +
              (isServicesSection ? " active" : "") +
              (collapsed ? " collapsed" : "")
            }
            onClick={toggleFlyout}
            aria-expanded={open}
            aria-haspopup="true"
          >
            <span className="side-icon">S</span>
            {!collapsed && <span className="side-label">Services ▾</span>}
          </button>

          {/* Results still navigates to its page */}
          <Item to="/mypage/results" label="Results" k="R" />
        </nav>
      </aside>

        {/* Flyout to the right of Services */}
        {open && (
        <div
            ref={panelRef}
            role="menu"
            className="side-flyout"
            style={{
            position: "fixed",
            top: flyPos.top,
            left: flyPos.left,
            width: 220,
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 8px 28px rgba(0,0,0,.22)",
            zIndex: 1100,
            overflow: "hidden",
            }}
        >
            <NavLink
            to="/mypage/services/feature-x"
            className="fly-item"
            onClick={() => setOpen(false)}
            >
            Use Feature X
            </NavLink>

            <NavLink
            to="/mypage/services/puresnet"
            className="fly-item"
            onClick={() => setOpen(false)}
            >
            PureSNet
            </NavLink>
        </div>
        )}
    </>
  );
}
