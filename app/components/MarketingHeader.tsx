"use client";

import Link from "next/link";
import { useState } from "react";
import { Brand } from "./Brand";

const links = [
  ["Product", "/#product"],
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
            <Link key={label} href={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <Link className="nav-login" href="/login" onClick={() => setOpen(false)}>
            Sign in
          </Link>
          <Link className="button button-small" href="/#pricing" onClick={() => setOpen(false)}>
            Start free
          </Link>
        </nav>
      </div>
    </header>
  );
}
