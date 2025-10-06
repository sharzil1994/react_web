// src/components/LeftSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function LeftSidebar({ collapsed, onToggle, fixed = false, top = 60 }) {
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

  return (
    <aside
      className={
        "sidebar " +
        (collapsed ? "collapsed " : "") +
        (fixed ? "sidebar-fixed " : "")
      }
      style={
        fixed
          ? {
              position: "fixed",
              left: 0,
              top,                                // align to bottom of header
              height: `calc(100vh - ${top}px)`,   // run to bottom of viewport
              borderRight: "1px solid var(--border)",
            }
          : undefined
      }
    >
      <div className="side-header">
        {!collapsed && <div className="side-title">My Page</div>}
        <button className="side-toggle" onClick={onToggle} title={collapsed ? "Expand" : "Collapse"}>
          {collapsed ? "»" : "«"}
        </button>
      </div>

      <nav className="side-nav">
        {/* Only inside My Page */}
        <Item to="/mypage/services" label="Services" k="S" />
        <Item to="/mypage/results"  label="Results"  k="R" />
      </nav>
    </aside>
  );
}
