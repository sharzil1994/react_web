import React, { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle.jsx";
import SettingsMenu from "./SettingsMenu.jsx";
import { doGlobalLogout } from "@/api/client"; // or "../api/client" if no alias
import { NavLink, Link, useNavigate } from "react-router-dom";
import BalancePanel from "./BalancePanel.jsx";

const linkClass = ({ isActive }) => "nav-link" + (isActive ? " active" : "");

export default function Navbar() {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(!!localStorage.getItem("authToken"));
  


  // Keep navbar in sync with login/logout anywhere in the app
  useEffect(() => {
    const update = () => setIsAuthed(!!localStorage.getItem("authToken"));
    const onCustom  = () => update();
    const onStorage = (e) => { if (!e || e.key === "authToken") update(); };
    window.addEventListener("auth:changed", onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("auth:changed", onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  async function handleLogoutFromMenu() {
    await doGlobalLogout();     // clears token + broadcasts events
    setIsAuthed(false);
    navigate("/login", { replace: true });
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="logo" aria-hidden="true"></span>
          <span>HelloWorld</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" className={linkClass} end>Home</NavLink>
          <NavLink to="/about" className={linkClass}>About</NavLink>
          <NavLink to="/services" className={linkClass}>Services</NavLink>
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>
          <NavLink to="/users" className={linkClass}>Users</NavLink>

          {/* ✅ MyPage appears ONLY when logged in */}
          {isAuthed && <NavLink to="/mypage" className={linkClass}>MyPage</NavLink>}

          {/* Login link replaced by non-usable badge when authed */}
          {!isAuthed ? (
            <NavLink to="/login" className={linkClass}>Login</NavLink>
          ) : (
            <span className="nav-link disabled" title="Already logged in">Logged in</span>
          )}

          <ThemeToggle />
        </div>
      </div>

      {/* ✅ Settings trigger pinned to right edge — ONLY when logged in */}
      {isAuthed && (
        <div className="settings-anchor">
          <BalancePanel />
          <SettingsMenu onLogout={handleLogoutFromMenu} />
        </div>
      )}
    </nav>
  );
}
