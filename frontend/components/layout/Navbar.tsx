"use client";

export default function Navbar() {
  return (
    <header className="cb-navbar" aria-label="Campus navigation">
      <div className="cb-navbar-tagline">THE CAMPUS, IN REAL TIME.</div>
      <div className="cb-search-bar">
        <input type="search" placeholder="Search campus..." aria-label="Search campus" />
        <span aria-hidden="true">⌕</span>
      </div>
    </header>
  );
}
