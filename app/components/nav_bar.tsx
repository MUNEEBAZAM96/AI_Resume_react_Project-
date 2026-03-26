import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Upload", to: "/upload" },
];

const Navbar = () => {
  const { auth } = usePuterStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  const user = auth.user;
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "?";

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await auth.signOut();
    navigate("/auth");
  };

  return (
    <header className="w-full px-4 pt-5 sticky top-0 z-40">
      <div className="navbar">

        {/* ── Brand ── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="primary-gradient w-9 h-9 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
            <span className="text-white font-bold text-base">R</span>
          </div>
          <span className="text-xl font-bold text-gradient tracking-tight hidden sm:block">
            Resume AI
          </span>
        </Link>

        {/* ── Nav links (desktop) ── */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, to }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${active
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-dark-200 hover:text-slate-900 hover:bg-gray-100"
                  }`}
              >
                {label}
                {active && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Right side ── */}
        <div className="flex items-center gap-2.5">

          {/* ── Authenticated: avatar dropdown ── */}
          {auth.isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                aria-label="Account menu"
                className={`relative w-10 h-10 rounded-full transition-all duration-200 ring-2
                  ${dropdownOpen
                    ? "ring-indigo-400 shadow-lg shadow-indigo-200/50 scale-105"
                    : "ring-transparent hover:ring-indigo-300 hover:shadow-md hover:scale-105"
                  }`}
              >
                <div className="primary-gradient w-full h-full rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {initials}
                </div>
                {/* Online indicator dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/80 overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-2 duration-150">

                  {/* Profile header */}
                  <div className="px-4 py-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="primary-gradient w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                        {initials}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {user.username}
                        </span>
                        <span className="text-xs text-dark-200 mt-0.5">
                          Puter Account
                        </span>
                      </div>
                      {/* Online dot */}
                      <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                      </span>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5 px-1.5">
                    <Link
                      to="/"
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                        ${pathname === "/" ? "bg-indigo-50 text-indigo-600" : "text-slate-700 hover:bg-gray-50"}`}
                    >
                      <span className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-sm">🏠</span>
                      My Resumes
                    </Link>
                    <Link
                      to="/upload"
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                        ${pathname === "/upload" ? "bg-indigo-50 text-indigo-600" : "text-slate-700 hover:bg-gray-50"}`}
                    >
                      <span className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-sm">📄</span>
                      Upload Resume
                    </Link>
                  </div>

                  {/* Divider + sign out */}
                  <div className="border-t border-gray-100 px-1.5 py-1.5">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <span className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-sm">👋</span>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

          ) : (
            /* ── Not authenticated ── */
            <Link to="/auth">
              <button className="primary-button w-fit px-5 py-2 text-sm font-semibold">
                Sign in
              </button>
            </Link>
          )}

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile menu panel ── */}
      {mobileOpen && (
        <div className="md:hidden mx-4 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-150">
          <nav className="flex flex-col p-2">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${pathname === to
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-700 hover:bg-gray-50"
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;


