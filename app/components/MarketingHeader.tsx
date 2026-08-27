"use client";

import { useState } from "react";
import { Brand } from "./Brand";

const links = [
  ["Home", "/"],
  ["Live Demo", "/demo"],
  ["About", "/about"],
  ["Download", "/download"],
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Brand compact />
        <button
          className="menu-button"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
        <nav className={open ? "nav-links is-open" : "nav-links"} aria-label="Primary navigation">
          {links.map(([label, href]) => (
            <a key={label} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          {/* Signing in happens inside the app, which is what the sign-up page has
              always told people. This pointed at the staff admin portal until
              27 Aug 2026 — a door for us, not for coaches, and one that is being
              retired with the platform rebuild. The site should not have a link
              that breaks the day it goes. */}
          <a href="/download" onClick={() => setOpen(false)}>
            Sign in
          </a>
          <a className="button button-small" href="/signup" onClick={() => setOpen(false)}>
            Sign up
          </a>
        </nav>
      </div>
    </header>
  );
}
