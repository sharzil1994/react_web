import React, { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { tokenStorage, probeAuth } from "@/api/client"; // use '../api/client' if no '@'

export default function RequireAuth() {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(!!tokenStorage.get());

  async function checkNow() {
    const token = tokenStorage.get();
    if (!token) { setAuthed(false); setChecking(false); return; }
    const ok = await probeAuth();            // server truth
    setAuthed(ok);
    setChecking(false);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => { if (!cancelled) { setChecking(true); await checkNow(); } })();

    const onAuthChanged = (e) => {
      const isOn = !!(e?.detail?.isAuthed);
      setAuthed(isOn);
      setChecking(false);
    };
    const onStorage = () => { checkNow(); };
    const onVisible = () => { if (!document.hidden) checkNow(); };

    window.addEventListener("auth:changed", onAuthChanged);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.removeEventListener("auth:changed", onAuthChanged);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // re-check if the user changes the URL while mounted
  }, [location.pathname]);

  if (checking) return null;                            // or a small spinner
  if (!authed) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;                                    // render the protected route tree
}
