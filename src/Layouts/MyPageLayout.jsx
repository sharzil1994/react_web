// src/layouts/MyPageLayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
// If '@' doesn't work in your project, change to:  import LeftSidebar from "../components/LeftSidebar.jsx";
import LeftSidebar from "@/components/LeftSidebar.jsx";

export default function MyPageLayout() {
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("leftSidebarCollapsed") === "1"
  );
  const [navH, setNavH] = useState(72); // header height fallback

  // measure navbar height so the fixed sidebar starts right under it
  useEffect(() => {
    const measure = () => {
      const nav = document.querySelector(".navbar");
      setNavH(nav?.offsetHeight || 72);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("leftSidebarCollapsed", next ? "1" : "0");
  };

  // shift content so it doesn't sit under the fixed sidebar
  const contentPadLeft = collapsed ? 72 : 236; // (64/220) + small gap

  return (
    <>
      {/* Fixed, screen-anchored sidebar */}
      <LeftSidebar fixed top={navH} collapsed={collapsed} onToggle={toggle} />

      {/* Main content shifted to the right */}
      <section className="side-main-fixed" style={{ paddingLeft: contentPadLeft, paddingTop: 12 }}>
        <Outlet />
      </section>
    </>
  );
}
