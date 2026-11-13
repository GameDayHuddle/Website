import Image from "next/image";

// The all-sports logo of 30 Oct 2026 — the cheering child on the navy-and-orange shield, the same
// badge the platform's web sidebar carries (Platform repo, apps/web/public/brand/badge.png,
// 237 × 192, drawn here at 59 × 48).
export function Brand() {
  return (
    <a className="brand" href="/" aria-label="GameDay Huddle home">
      <Image className="brand-badge" src="/badge.png" alt="" width={59} height={48} priority unoptimized />
      <span className="brand-name">
        GameDay <strong>Huddle</strong>
      </span>
    </a>
  );
}
