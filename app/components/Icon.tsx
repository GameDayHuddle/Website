// One outline icon set for the whole site: 24-unit grid, drawn in currentColor.
const paths = {
  registration: (
    <>
      <path d="M9 3.5h6v3H9z" />
      <path d="M15 5h2.5A1.5 1.5 0 0 1 19 6.5V11M9 5H6.5A1.5 1.5 0 0 0 5 6.5v13A1.5 1.5 0 0 0 6.5 21H11" />
      <path d="M8.5 10.5h6M8.5 14h3.5" />
      <path d="M19.5 13.5l2 2-5.5 5.5H14v-2z" />
    </>
  ),
  documents: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 14.5l2 2 4-4" />
    </>
  ),
  messaging: <path d="M5 4.5h14A1.5 1.5 0 0 1 20.5 6v9.5A1.5 1.5 0 0 1 19 17h-9l-5 3.5V6A1.5 1.5 0 0 1 5 4.5z" />,
  fundraising: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9.2c-.6-1-1.7-1.5-3-1.5-1.7 0-3 .9-3 2.2s1.3 1.8 3 2.1 3 .9 3 2.2-1.3 2.2-3 2.2c-1.4 0-2.5-.6-3.1-1.6M12 6v1.7M12 16.4V18" />
    </>
  ),
  equipment: (
    <>
      <path d="M3.5 13.5A8.5 8.5 0 0 1 20 10.5V14h-6l-1.5 3H6a2.5 2.5 0 0 1-2.5-2.5z" />
      <path d="M14 14v3.5h6.5M17.25 14v3.5" />
      <circle cx="9" cy="11.5" r="1.1" />
    </>
  ),
  football: (
    <>
      <ellipse cx="12" cy="12" rx="9.5" ry="5.6" transform="rotate(-45 12 12)" />
      <path d="M9.5 14.5l5-5M10.3 11.7l2 2M11.7 10.3l2 2" />
    </>
  ),
  flag: <path d="M5.5 21V3.5M5.5 4h12l-2.5 4.5L17.5 13h-12" />,
  cheer: (
    <>
      <path d="M3.5 10v4a1 1 0 0 0 1 1H7l7.5 4V5L7 9H4.5a1 1 0 0 0-1 1z" />
      <path d="M17.5 8.5a5 5 0 0 1 0 7M20 6a8.5 8.5 0 0 1 0 12" />
    </>
  ),
  playbook: (
    <>
      <circle cx="6.5" cy="6.5" r="2.5" />
      <path d="M15.5 4l4 4M19.5 4l-4 4" />
      <path d="M6.5 11.5c0 4.5 4 7.5 10 7.5" />
      <path d="M14.5 16.5l2.5 2.5-2.5 2.5" />
    </>
  ),
  analytics: <path d="M3 20.5h18M6.5 17v-5M11.5 17V6.5M16.5 17v-8M20 6l-3.5 1.5" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4M7.5 13.5h2M11 13.5h2M14.5 13.5h2M7.5 17h2M11 17h2" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16.2 14.1A5 5 0 0 1 21.5 19" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  payments: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M2.5 10h19M6 15h4" />
    </>
  ),
  reports: (
    <>
      <path d="M4 20V4M4 20h16" />
      <path d="M7.5 15.5l4-4 3 3 5-6" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" />
      <path d="M10 21h4" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  back: <path d="M15 5l-7 7 7 7" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  share: (
    <>
      <path d="M12 15V3.5M7.5 8L12 3.5 16.5 8" />
      <path d="M5 12v7.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V12" />
    </>
  ),
  qr: (
    <>
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1" />
      <path d="M14 14h2.5v2.5H14zM18 18h2.5v2.5H18zM14 18.5v2M20.5 14v2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className, strokeWidth = 1.8 }: { name: IconName; className?: string; strokeWidth?: number }) {
  return (
    <svg
      className={className ? `icon ${className}` : "icon"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
