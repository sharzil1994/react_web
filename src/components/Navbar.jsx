import React, { useEffect, useState } from "react";
// import ThemeToggle from "./ThemeToggle.jsx";
import SettingsMenu from "./SettingsMenu.jsx";
// import { doGlobalLogout } from "@/api/client"; // or "../api/client" if no alias
import { doGlobalLogout, probeAuth, tokenStorage } from "@/api/client";
import { NavLink, Link, useNavigate, useLocation  } from "react-router-dom";
import BalancePanel from "./BalancePanel.jsx";

const linkClass = ({ isActive }) => "nav-link" + (isActive ? " active" : "");

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  // const [isAuthed, setIsAuthed] = useState(!!localStorage.getItem("authToken"));
  const [isAuthed, setIsAuthed] = useState(!!tokenStorage.get());


  // Keep navbar in sync with login/logout anywhere in the app
  useEffect(() => {
    // const update = () => setIsAuthed(!!localStorage.getItem("authToken"));
    async function check() {
      // If there is no token at all, we are definitely logged out
      if (!tokenStorage.get()) { setIsAuthed(false); return; }
      // Probe server to confirm the token is valid
      const ok = await probeAuth();
      if (!ok) {
        await doGlobalLogout();           // clear tokens + broadcast events
        setIsAuthed(false);
      } else {
        setIsAuthed(true);
      }
    }

    const update = () => setIsAuthed(!!tokenStorage.get());

    const onCustom  = () => update();
    // const onStorage = (e) => { if (!e || e.key === "authToken") update(); };
    const onStorage = (e) => {
      if (!e || e.key === "authToken" || e.key === "access_token") update();
    };
    const onVisible = () => { if (!document.hidden) check(); };


    // window.addEventListener("auth:changed", onCustom);
    // window.addEventListener("storage", onStorage);
    check();
    window.addEventListener("auth:changed", onCustom);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);


    return () => {
      window.removeEventListener("auth:changed", onCustom);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
      const el = document.querySelector(".nav-links .nav-link.active");
      el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }, [location.pathname]);


  async function handleLogoutFromMenu() {
    await doGlobalLogout();     // clears token + broadcasts events
    setIsAuthed(false);
    navigate("/login", { replace: true });
  }

return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={isAuthed ? "/mypage" : "/login"} className="brand">
          <span className="logo" aria-hidden="true"></span>
          <span>JYBio</span>
        </Link>

        {/* Add role for better a11y on horizontal tabs */}
        <div className="nav-links" role="tablist" aria-label="Primary">
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>
          {isAuthed && <NavLink to="/mypage" className={linkClass}>MyPage</NavLink>}
          {!isAuthed ? (
            <NavLink to="/login" className={linkClass}>Login</NavLink>
          ) : (
            <span className="nav-link disabled" title="Already logged in">Logged in</span>
          )}
        </div>
      </div>

      {isAuthed && (
        <div className="settings-anchor">
          <BalancePanel />
          <SettingsMenu onLogout={handleLogoutFromMenu} />
        </div>
      )}
    </nav>
  );
}
