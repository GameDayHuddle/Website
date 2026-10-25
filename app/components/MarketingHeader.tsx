"use client";

import { useEffect, useRef, useState } from "react";
import { Brand } from "./Brand";
import { Icon } from "./Icon";
import { APP_URL, DEMO_HREF, legalLinks, organizationLinks, platformLinks } from "./links";

type Menu = { label: string; items: readonly (readonly [string, string])[] };

const menus: Menu[] = [
  { label: "Platform", items: platformLinks },
  { label: "For Organizations", items: organizationLinks.filter(([label]) => label !== "Pricing") },
];
const resources: Menu = { label: "Resources", items: legalLinks };

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setMenu(null);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenu(null);
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function close() {
    setMenu(null);
    setOpen(false);
  }

  function dropdown({ label, items }: Menu) {
    const id = `menu-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const expanded = menu === label;
    return (
      <div className={expanded ? "nav-group is-open" : "nav-group"} key={label}>
        <button
          className="nav-trigger"
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setMenu(expanded ? null : label)}
        >
          {label}
          <Icon name="chevron" strokeWidth={2.2} />
        </button>
        <ul className="nav-menu" id={id}>
          {items.map(([text, href]) => (
            <li key={text}>
              <a href={href} onClick={close}>
                {text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Brand />
        <button
          className="menu-button"
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name={open ? "close" : "menu"} strokeWidth={2.2} />
        </button>
        <nav
          id="primary-navigation"
          ref={navRef}
          className={open ? "nav-links is-open" : "nav-links"}
          aria-label="Primary navigation"
        >
          <div className="nav-primary">
            {menus.map(dropdown)}
            <a className="nav-link" href="/#pricing" onClick={close}>
              Pricing
            </a>
            {dropdown(resources)}
          </div>
          <div className="nav-actions">
            <a className="nav-signin" href={APP_URL}>
              Sign In
            </a>
            <a className="button button-small" href={DEMO_HREF}>
              Book a Demo <Icon name="arrow" strokeWidth={2.2} />
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
