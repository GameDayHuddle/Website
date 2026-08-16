"use client";

import { useState } from "react";
import { Brand } from "./Brand";

const links = [
  ["Product", "/#workflow"],
  ["Live Demo", "/demo"],
  ["For organizations", "/#organizations"],
  ["Pricing", "/pricing"],
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
          <a className="button button-small" href="/signup" onClick={() => setOpen(false)}>
            Sign up
          </a>
        </nav>
      </div>
    </header>
  );
}
