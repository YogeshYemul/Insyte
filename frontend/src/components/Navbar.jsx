import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((v) => !v);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onEscape = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <nav className="navbar" aria-label="Main">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-icon" aria-hidden>
            📊
          </span>
          <span className="logo-text">Insyte</span>
        </Link>

        <ul
          className={`nav-menu ${isOpen ? "nav-menu--open" : ""}`}
          id="primary-navigation"
        >
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/upload" className="nav-link" onClick={closeMenu}>
              Upload
            </Link>
          </li>
          <li className="nav-item">
            <a href="/#features" className="nav-link" onClick={closeMenu}>
              Features
            </a>
          </li>
          <li className="nav-item">
            <a href="/#about" className="nav-link" onClick={closeMenu}>
              About
            </a>
          </li>
          <li className="nav-item nav-item-mobile-cta">
            <Link to="/upload" className="nav-link nav-cta-link" onClick={closeMenu}>
              Get started
            </Link>
          </li>
        </ul>

        <Link to="/upload" className="cta-button" onClick={closeMenu}>
          Get started
        </Link>

        <button
          type="button"
          className={`hamburger ${isOpen ? "hamburger--open" : ""}`}
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-controls="primary-navigation"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile: dim page + tap outside to close; menu panel stacks above this */}
      <button
        type="button"
        className={`nav-backdrop ${isOpen ? "nav-backdrop--visible" : ""}`}
        onClick={closeMenu}
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="navbar-glow" aria-hidden />
    </nav>
  );
}
