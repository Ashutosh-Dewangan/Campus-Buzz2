"use client";

export default function Navbar() {
  return (
    <header className="cb-navbar">
      {/* Search bar */}
      <div className="cb-search-bar">
        <input type="text" placeholder="Search campus..." />
        <span style={{ fontSize: 14, color: "var(--fg-muted)" }}>🔍</span>
      </div>
    </header>
  );
}