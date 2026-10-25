# GameDay Huddle website

The marketing site at **www.gamedayhuddle.com** for GameDay Huddle — registration, document
management, team messaging, fundraising and equipment for youth football (tackle and flag) and
cheer organizations. One page, published to GitHub Pages.

**No price figure goes on this site** — not on the page, and not in this public repository's
code, docs or commit messages. That is Doug's ruling of 4 October 2026: the price could change.
The pricing section says what the store listings say — free for families, no subscription or
paid add-on, no fee on fundraising — and asks clubs to get in touch for their price.
`tests/rendered-html.test.mjs` guards it.

The platform itself lives at **app.gamedayhuddle.com** (the `GameDayHuddle/Platform` repository).
This site only links to it: Sign In, Support, the privacy policy, the terms and account deletion
are all the platform's own pages. Keeping the two apart keeps this site's scripts off the origin
where parents pay and enter children's details.

## What changed on 25 October 2026

The site used to sell the retired Android tablet coaching app — APK downloads, sign-up, an
account portal and Stripe subscriptions. All of that is gone (it is in git history). The old
addresses (`/download`, `/signup`, `/demo`, `/about`, `/contact`, `/login`, `/account`, `/admin`,
`/privacy`, `/terms`) now forward somewhere true; see `scripts/export-github-pages.mjs`.

The colours are the platform's own (`docs/design/visual-style.md` in the Platform repository):
navy `#06193d`, the bright orange `#f45d0a` as a fill with bold white labels of at least 18.66px,
`#c05000` for orange words on white. Headings are Archivo, body text Inter, both self-hosted
from `@fontsource-variable`.

The coaching tools (playbook creation, in-game analytics, jamboree scheduling) are shown as
**coming soon, free** — they are built or planned but not yet released inside the app.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

The local site opens at `http://localhost:3000`. To see exactly what GitHub Pages will serve:

```bash
npm run export:pages
npm run preview:pages
```

## Validation

```bash
npm test
npm run lint
```

## Hosting

Every push to `main` builds the static export (`npm run export:pages`) and deploys it to GitHub
Pages (`.github/workflows/pages.yml`), on the custom domain `www.gamedayhuddle.com`.

The Cloudflare worker, D1 schema and `drizzle/` migrations are the toolchain the site was first
generated with; the build still runs through them, but nothing on the page uses a database.
