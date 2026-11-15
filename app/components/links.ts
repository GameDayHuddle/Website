// The platform lives at app.gamedayhuddle.com; this site only points at it (PROJECT-NOTES,
// 1–2 Oct 2026, "the web address"). Every link that leaves the marketing site is here.
export const APP_URL = "https://app.gamedayhuddle.com";
export const SUPPORT_EMAIL = "support@gamedayhuddle.com";
export const DEMO_EMAIL = "doug@gamedayhuddle.com";
// Doug, 14 Nov 2026: Book a Demo is the contact form, which the platform's own server emails
// to him (DEMO_EMAIL is the address a failed send offers instead).
export const DEMO_HREF = "/book-a-demo";
// Doug, 14 Nov 2026 ("the email didn't go out"): production answered this route only from the
// platform's release, so until then the form posted to the platform's dev server (platform
// docs/demo-request.md DR-12). 15 Nov 2026: the release is on production, which answers the route
// and allows this site's origin, so the form posts to production again.
export const DEMO_REQUEST_URL = "https://api.gamedayhuddle.com/public/demo-requests";

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
  ["In-town leagues", "/#leagues"],
  ["Running the team", "/#club"],
  ["Every youth sport", "/#sports"],
] as const;

export const organizationLinks = [
  ["Pricing", "/#pricing"],
] as const;
