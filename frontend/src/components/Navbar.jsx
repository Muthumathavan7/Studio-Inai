import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/schedule", label: "Schedule" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const transparent = isHome && !scrolled;
  const useDark = transparent; // dark = light text on dark hero

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        transparent
          ? "bg-transparent"
          : "bg-stone-50/85 backdrop-blur-xl border-b border-stone-200"
      }`}
      data-testid="site-navbar"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <Link to="/" data-testid="nav-logo-link">
          <Logo dark={useDark} />
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `font-display text-sm tracking-wide transition-colors duration-300 ${
                  !useDark
                    ? isActive ? "text-stone-900" : "text-stone-500 hover:text-stone-900"
                    : isActive ? "text-stone-50" : "text-stone-300 hover:text-stone-50"
                }`
              }
              end={l.to === "/"}
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/schedule"
            data-testid="nav-cta-book"
            className={`font-display text-sm tracking-wide px-5 py-2.5 border transition-all duration-500 ${
              !useDark
                ? "border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-stone-50"
                : "border-stone-50 text-stone-50 hover:bg-stone-50 hover:text-stone-900"
            }`}
          >
            Book a Consultation
          </Link>
        </nav>

        <button
          className={`md:hidden p-2 ${useDark ? "text-stone-50" : "text-stone-900"}`}
          onClick={() => setOpen((v) => !v)}
          data-testid="nav-mobile-toggle"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-stone-50 border-t border-stone-200" data-testid="nav-mobile-menu">
          <div className="px-6 py-6 flex flex-col gap-5">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                data-testid={`mnav-link-${l.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `font-display text-base ${isActive ? "text-stone-900" : "text-stone-500"}`
                }
                end={l.to === "/"}
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/schedule"
              className="font-display text-sm tracking-wide px-5 py-3 border border-stone-900 text-stone-900 text-center"
              data-testid="mnav-cta-book"
            >
              Book a Consultation
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
