import Image from "next/image";

// The final logo (build 58, 24 Oct 2026) — the same badge the platform's web sidebar carries.
export function Brand() {
  return (
    <a className="brand" href="/" aria-label="GameDay Huddle home">
      <Image className="brand-badge" src="/badge.png" alt="" width={45} height={48} priority unoptimized />
      <span className="brand-name">
        GameDay <strong>Huddle</strong>
      </span>
    </a>
  );
}
