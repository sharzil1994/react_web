import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "@/components/LeftSidebar.jsx"; // use ../components/... if no '@' alias

export default function SideLayout() {
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("leftSidebarCollapsed") === "1"
  );
  return (
    <div className={"side-layout" + (collapsed ? " collapsed" : "")}>
      <LeftSidebar
        collapsed={collapsed}
        onToggle={() => {
          const next = !collapsed;
          setCollapsed(next);
          localStorage.setItem("leftSidebarCollapsed", next ? "1" : "0");
        }}
      />
      <section className="side-main">
        <Outlet />
      </section>
    </div>
  );
}
