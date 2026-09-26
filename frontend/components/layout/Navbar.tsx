"use client";

export default function Navbar() {
  return (
    <header className="cb-navbar" aria-label="Campus navigation">
      <div className="cb-navbar-tagline">What&apos;s happening on campus?</div>
      <div className="cb-search-bar">
        <input type="search" placeholder="Search campus..." aria-label="Search campus" />
        <span aria-hidden="true">⌕</span>
      </div>
    </header>
  );
}
