import type { ReactNode } from "react";

// One line-drawn set on a shared 24-grid, so the badge on a hero mark, the row
// of a benefit and the face of a plan card all carry the same weight. Stroke
// only: the page is near-black, and a filled glyph this small closes up into a
// blob against it.
const strokes: Record<string, ReactNode> = {
  // A coach's whistle — the head coach founding a team.
  whistle: (
    <>
      <circle cx="9.4" cy="14.1" r="5.4" />
      <path d="M14.5 12.1H21l-1.7 3.4h-4.6" />
      <path d="M9.4 8.7V6.6" />
      <path d="M6.6 5.1h5.6" />
    </>
  ),
  // A torn ticket — the coach who was handed a code.
  ticket: (
    <>
      <path d="M3.2 8.6c0-1 .8-1.8 1.8-1.8h14c1 0 1.8.8 1.8 1.8v1.1a2.3 2.3 0 0 0 0 4.6v1.1c0 1-.8 1.8-1.8 1.8H5a1.8 1.8 0 0 1-1.8-1.8v-1.1a2.3 2.3 0 0 0 0-4.6V8.6Z" />
      <path d="M14.2 8.4v1.7M14.2 13.9v1.7" />
    </>
  ),
  // Two figures — a program with staff under it.
  people: (
    <>
      <circle cx="9" cy="8.1" r="3.1" />
      <path d="M3.6 19.4c0-3.3 2.4-5.2 5.4-5.2s5.4 1.9 5.4 5.2" />
      <path d="M16.1 5.6a3.1 3.1 0 0 1 0 5.9" />
      <path d="M17.4 14.5c2 .5 3.3 2.2 3.3 4.6" />
    </>
  ),
  // A single figure — the account being created.
  user: (
    <>
      <circle cx="12" cy="8.4" r="3.8" />
      <path d="M4.8 20c0-3.9 3.2-6.2 7.2-6.2s7.2 2.3 7.2 6.2" />
    </>
  ),
  // A play card on a clipboard — the playbook.
  clipboard: (
    <>
      <path d="M9.2 4.4H7.4a2 2 0 0 0-2 2v12.9a2 2 0 0 0 2 2h9.2a2 2 0 0 0 2-2V6.4a2 2 0 0 0-2-2h-1.8" />
      <rect x="9.2" y="2.6" width="5.6" height="3.6" rx="1.2" />
      <path d="M8.6 11.1h6.8M8.6 14.7h4.4" />
    </>
  ),
  // Bars off a baseline — the derived numbers.
  chart: (
    <>
      <path d="M4 20.2h16" />
      <path d="M6.4 17.6v-5.4M11 17.6V8.4M15.6 17.6v-3.2M20.2 17.6V5.2" />
    </>
  ),
  // Two tablets on one line — the staff seat and the Play Keeper's link.
  tablets: (
    <>
      <rect x="2.4" y="5.2" width="7.2" height="13.6" rx="1.6" />
      <rect x="14.4" y="5.2" width="7.2" height="13.6" rx="1.6" />
      <path d="M10.4 12h3.2" />
      <path d="M5.4 16.4h1.2M17.4 16.4h1.2" />
    </>
  ),
  // Signal arcs, struck through — recording that never waits on a network.
  offline: (
    <>
      <path d="M8.4 15.4a5 5 0 0 1 7.2 0" />
      <path d="M5 12.1a9.7 9.7 0 0 1 14 0" />
      <path d="M11.95 18.8h.1" />
      <path d="M3.4 3.4 20.6 20.6" />
    </>
  ),
  // A shield with a check — the data staying on the coach's own tablet.
  shield: (
    <>
      <path d="M12 2.9 4.9 5.7v6.1c0 4.1 2.9 7.5 7.1 8.9 4.2-1.4 7.1-4.8 7.1-8.9V5.7L12 2.9Z" />
      <path d="m8.9 11.9 2.2 2.2 4-4.4" />
    </>
  ),
  // A play button — game day, running.
  play: (
    <>
      <circle cx="12" cy="12" r="9.1" />
      <path d="M10.2 8.5 15.8 12l-5.6 3.5V8.5Z" />
    </>
  ),
  // The ball itself, laces up — the season band at the foot of the page.
  football: (
    <>
      <path d="M4.4 19.6C2.6 14.5 3 7.4 4.5 4.5c2.9-1.5 10-1.9 15.1-.1 1.8 5.1 1.4 12.2-.1 15.1-2.9 1.5-10 1.9-15.1.1Z" transform="rotate(45 12 12)" />
      <path d="M9.1 14.9 14.9 9.1" />
      <path d="m10.1 12.3 1.6 1.6M11.7 10.7l1.6 1.6M12.9 15.1l1.6-1.6" />
    </>
  ),
  eye: (
    <>
      <path d="M2.4 12S6 5.6 12 5.6 21.6 12 21.6 12 18 18.4 12 18.4 2.4 12 2.4 12Z" />
      <circle cx="12" cy="12" r="2.9" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M9.6 5.9A9.4 9.4 0 0 1 12 5.6c6 0 9.6 6.4 9.6 6.4a17.6 17.6 0 0 1-2.9 3.7" />
      <path d="M6.2 7.6A17.4 17.4 0 0 0 2.4 12S6 18.4 12 18.4a9.6 9.6 0 0 0 3.7-.7" />
      <path d="M10 10a2.9 2.9 0 0 0 4 4" />
      <path d="M3.4 3.4 20.6 20.6" />
    </>
  ),
};

export type SignupIconName = keyof typeof strokes;

export function SignupIcon({ name, className }: { name: SignupIconName; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {strokes[name]}
    </svg>
  );
}
