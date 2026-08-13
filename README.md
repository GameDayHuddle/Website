# GameDay Huddle website

The customer website and account portal for GameDay Huddle, an Android football coaching app for playbooks, game-day calling, staff collaboration, and analytics.

## Included

- Product-led marketing site with SEO metadata, sitemap, robots rules, social card, pricing, about, organization sales, and Android download pages.
- Downloadable Android beta APKs for both apps: GameDay Huddle (coaches) and GameDay Huddle Play Keeper (the Play Analyst). The Android repository's CI replaces the files in `public/downloads/` and rewrites `app/download/manifest.json` on every push to its main branch, so the download page always serves the latest signed builds without hand steps.
- Organization and beta inquiry forms backed by Cloudflare D1 for CRM lead capture.
- Customer account portal with plan, payment summary, team access, invoices, and Stripe customer-portal handoff for payment updates and cancellation.
- Admin workspace for subscription monitoring, prospect tracking, password-reset support, account notes, and cancellation review.
- Stripe Checkout, customer portal, signed webhook handling, and subscription record synchronization.
- Responsive layouts, keyboard states, reduced-motion support, and automated rendered-page checks.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

The local site opens at `http://localhost:3000`.

## Configuration

Copy `.env.example` to `.env.local` and provide the values for the services being tested. Never commit live secret keys.

The D1 schema is in `db/schema.ts`; generated migrations are kept in `drizzle/`.

## Validation

```bash
npm run build
npm test
npm run lint
```

## Hosting model

This source belongs in the `GameDayhuddle/Website` GitHub repository. The complete product is a full-stack app: GitHub Pages can publish static HTML, CSS, and JavaScript, but it cannot run the authentication, CRM, Stripe session, or webhook endpoints. Deploy the repository to a server-backed host such as Cloudflare Workers/Sites; keep GitHub as the source of truth and CI origin.

Before public launch:

1. Set the production site URL and Stripe keys/prices.
2. Configure the Stripe customer portal and register `/api/stripe/webhook`.
3. Apply the D1 migrations.
4. Set the administrator email allowlist.
5. Replace preview portal data with production queries.
6. Review the draft privacy policy and terms with counsel.
7. Replace the testing APK with a signed release or Google Play listing.
