// The platform lives at app.gamedayhuddle.com; this site only points at it (PROJECT-NOTES,
// 1–2 Oct 2026, "the web address"). Every link that leaves the marketing site is here.
export const APP_URL = "https://app.gamedayhuddle.com";
export const SUPPORT_EMAIL = "support@gamedayhuddle.com";
export const DEMO_EMAIL = "doug@gamedayhuddle.com";
export const DEMO_HREF = `mailto:${DEMO_EMAIL}?subject=${encodeURIComponent("GameDay Huddle demo")}`;
export const PRICING_HREF = `mailto:${DEMO_EMAIL}?subject=${encodeURIComponent("GameDay Huddle pricing")}`;

export const legalLinks = [
  ["Support", `${APP_URL}/support`],
  ["Privacy policy", `${APP_URL}/privacy`],
  ["Terms of service", `${APP_URL}/terms`],
  ["Delete an account", `${APP_URL}/delete-account`],
] as const;

export const platformLinks = [
  ["Online registration", "/#registration"],
  ["Team messaging", "/#messaging"],
  ["Fundraising", "/#fundraising"],
  ["In-house leagues", "/#leagues"],
  ["Running the club", "/#club"],
] as const;

export const organizationLinks = [
  ["Every youth sport", "/#sports"],
  ["How it works", "/#how-it-works"],
  ["Pricing", "/#pricing"],
] as const;
