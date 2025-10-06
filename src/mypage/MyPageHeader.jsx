// src/components/mypage/MyPageHeader.jsx
import React from "react";

export default function MyPageHeader() {
  return (
    <div className="mypage-header">
      <div className="mypage-title">
        <h1>My Page</h1>
        <p className="subtitle">Your workspace with quick widgets.</p>
      </div>

      <div className="mypage-widgets">
        <div className="card">
          <strong>Quick Action</strong>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Put any persistent controls here.
          </p>
        </div>
        <div className="card">
          <strong>Status</strong>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Persistent info shown on all tabs.
          </p>
        </div>
      </div>
    </div>
  );
}
