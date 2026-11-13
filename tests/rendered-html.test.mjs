import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

const decode = (text) =>
  text
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

// What a visitor, a screen reader or a link preview can read: the page's words, its alt and
// aria-label text, its meta and Open Graph tags, its title and its JSON-LD. The framework's own
// scripts are left out — their payload is full of "$" markers that are not money.
function readable(html) {
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => match[1]);
  const withoutCode = html.replace(/<script\b[\s\S]*?<\/script>/g, " ").replace(/<style\b[\s\S]*?<\/style>/g, " ");
  const attributes = [...withoutCode.matchAll(/\s(?:alt|aria-label|content|title)="([^"]*)"/g)].map((match) => match[1]);
  const words = withoutCode.replace(/<[^>]+>/g, " ");
  return decode([words, ...attributes, ...jsonLd].join(" \n ")).replace(/\s+/g, " ");
}

const page = (async () => {
  const response = await render();
  return { response, html: await response.text() };
})();

test("the home page sells the platform: registration, messaging, fundraising and in-house leagues for any youth sport", async () => {
  const { response, html } = await page;
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const text = readable(html);
  assert.match(html, /application\/ld\+json/);
  assert.match(text, /Run your youth sports club\. From your phone\./);
  for (const feature of [
    "Online registration",
    "Team messaging",
    "Fundraising",
    "In-house leagues",
    "Running the club",
    "Every youth sport",
    // Registration, built and shared on the phone, paid without a stored card.
    "printable flyer",
    "QR code",
    "promo codes",
    "Apple Pay",
    "Google Pay",
    "No card is stored for next time",
    "second guardian",
    "club’s own Stripe account",
    // Messaging.
    "group chat for every team",
    "Entire Org Message",
    "Parent Message",
    "RSVPs",
    "calendar you can subscribe to",
    // Fundraising.
    "Donation drives and item sales",
    "page and a QR code for every player",
    // In-house leagues.
    "auto-balance",
    "live draft",
    "standings",
    // Running the club.
    "Roles for the President, Treasurer, Commissioner, coaches",
    "setup checklist",
    "Season admin",
    "arrive by email as a sign-in link",
    "No ads, no analytics",
  ]) assert.ok(text.includes(feature), feature);
});

test("every youth sport is on the page, the family picks the age group, and teams form three ways", async () => {
  const text = readable((await page).html);
  // The app's catalogue (packages/contracts/src/sports.ts in the Platform repository), and Other.
  for (const sport of ["Baseball", "Basketball", "Cheer", "Flag football", "Hockey", "Lacrosse", "Soccer", "Softball", "Tackle football", "Volleyball", "Wrestling", "Other"]) {
    assert.ok(text.includes(sport), sport);
  }
  assert.match(text, /Age shows only as a warning\. Nothing places a child automatically\./);
  assert.match(text, /by hand, by auto-balance or by a live draft/);
});

// The closed decisions, now that they govern in-house leagues: no rating, score, evaluation or
// statistic about a registered child, and standings are team results only.
test("a draft shows only the basics, and standings are team results", async () => {
  const text = readable((await page).html);
  assert.match(text, /name, age, age group, last season’s team and siblings\. No ratings or evaluations, ever/);
  assert.match(text, /team results, never statistics about a child/);
  const rest = text.replace("No ratings or evaluations, ever", "").replace("never statistics about a child", "");
  for (const word of [/statistic/i, /\bstats\b/i, /\bratings?\b/i, /\bevaluation/i, /\bskill/i]) assert.doesNotMatch(rest, word);
});

test("nothing retired, cancelled or unreleased is advertised", async () => {
  const text = readable((await page).html);
  // Football only as two sports in the list, never as what the platform is for.
  assert.doesNotMatch(text.replaceAll("Flag football", "").replaceAll("Tackle football", ""), /football/i);
  for (const gone of [
    /youth football/i,
    /tackle,? (?:and|&) flag/i,
    /cheer organi[sz]ation/i,
    // The coaching layer is cancelled, and nothing is shown as coming.
    /coaching/i,
    /playbook/i,
    /play[- ]?call/i,
    /call (?:the )?(?:game|plays)/i,
    /in-game/i,
    /depth chart/i,
    /\bformations?\b/i,
    /jamboree/i,
    /coming soon/i,
    /\bsoon\b/i,
    // Documents, equipment, weight, tickets, sponsorships and club branding are out of the app.
    /document/i,
    /waiver/i,
    /agreement/i,
    /birth certificate/i,
    /code of conduct/i,
    /equipment/i,
    /helmet/i,
    /\bgear\b/i,
    /\bweigh/i,
    /ticket/i,
    /sponsor/i,
    /branding/i,
    /colou?rs/i,
    // No emergency or urgent messages, no report or block, no card kept on file.
    /emergency/i,
    /urgent/i,
    /\balert/i,
    /\bblock/i,
    /report(?:ing)? (?:a |abuse|someone|users?)/i,
    /cards? on file/i,
    /saved cards?/i,
    /save (?:a|your) card/i,
    /raffle/i,
  ]) assert.doesNotMatch(text, gone);
});

// Doug's ruling of 4 Oct 2026: the platform's price could change, so no public page names it,
// and neither does this public repository. The pictures show no money at all, so the page
// carries no currency of any kind.
test("no price figure is public, and no fee mechanics either", async () => {
  const text = readable((await page).html);
  assert.doesNotMatch(text, /\$/);
  assert.doesNotMatch(text, /\bdollars?\b|\bcents?\b|\bUSD\b/i);
  assert.doesNotMatch(text, /\bper (?:athlete|player|child|registration|season|team|month)\b/i);
  assert.doesNotMatch(text, /platform fee|application fee|capped at|processing fee is/i);
  assert.match(text, /Free for families/i);
  assert.match(text, /No subscription/);
  assert.match(text, /No paid add-ons/);
  assert.match(text, /No fee on fundraising/);
  assert.match((await page).html, /href="mailto:doug@gamedayhuddle\.com\?subject=GameDay%20Huddle%20pricing"/);

  const files = ["README.md", ".env.example"];
  for (const dir of ["app", "scripts", "tests", ".github"]) {
    for (const entry of await readdir(new URL(`../${dir}/`, import.meta.url), { recursive: true })) {
      if (/\.(?:ts|tsx|mjs|css|yml)$/.test(entry)) files.push(`${dir}/${entry.replaceAll("\\", "/")}`);
    }
  }
  for (const file of files) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /\$\s?\d/, file);
    assert.doesNotMatch(source, /\bdollars\b/i, file);
  }
});

test("every way out goes to the live platform, never to the tablet app's doors", async () => {
  const { html } = await page;
  assert.match(html, /href="https:\/\/app\.gamedayhuddle\.com"/);
  for (const path of ["privacy", "terms", "support", "delete-account"]) {
    assert.match(html, new RegExp(`href="https://app\\.gamedayhuddle\\.com/${path}"`), path);
  }
  assert.match(html, /href="mailto:doug@gamedayhuddle\.com\?subject=GameDay%20Huddle%20demo"/);
  for (const gone of [
    /href="\/(?:download|signup|login|account|demo|about|contact)"/,
    /href="\/?#(?:documents|equipment|coaching)"/,
    /\.apk\b/i,
    /Offline-first/i,
    /Android 8/i,
    /Create your account/i,
    /One flat price/i,
  ]) assert.doesNotMatch(html, gone);
});

test("the retired tablet-app pages no longer render", async () => {
  for (const path of ["/download", "/signup", "/demo", "/account", "/admin"]) {
    const response = await render(path);
    assert.equal(response.status, 404, path);
  }
});

test("the GitHub Pages export forwards every retired address", async () => {
  const source = await readFile(new URL("../scripts/export-github-pages.mjs", import.meta.url), "utf8");
  for (const path of ["/about", "/demo", "/download", "/signup", "/contact", "/login", "/account", "/admin", "/privacy", "/terms"]) {
    assert.match(source, new RegExp(`\\["${path}", `), path);
  }
  assert.match(source, /\["\/privacy", `\$\{app\}\/privacy`\]/);
  // Nothing forwards to a section the page no longer has.
  assert.doesNotMatch(source, /#(?:coaching|documents|equipment)/);
  assert.match(source, /"404\.html"/);
});

test("the white-on-orange rule holds: bright-orange fills carry bold labels of at least 18.66px", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  for (const selector of [".button", ".button-small", ".mock-button", ".skip-link"]) {
    const rule = css.match(new RegExp(`^\\${selector} \\{([^}]*)\\}`, "m"));
    assert.ok(rule, selector);
    const size = rule[1].match(/font-size: ([\d.]+)px/);
    if (size) assert.ok(Number(size[1]) >= 18.66, `${selector} is ${size[1]}px`);
  }
  assert.match(css, /--orange: #f45d0a;/);
  assert.match(css, /--orange-text: #c05000;/);
});

const pngSize = async (file) => {
  const bytes = await readFile(new URL(`../public/${file}`, import.meta.url));
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
};

test("the brand files the page names are shipped, at the sizes the page draws them", async () => {
  for (const file of ["badge.png", "icon.png", "apple-icon.png", "og.png"]) {
    await access(new URL(`../public/${file}`, import.meta.url));
  }
  // The all-sports badge (30 Oct 2026) is wider than it is tall; the header keeps its shape.
  const badge = await pngSize("badge.png");
  const brand = await readFile(new URL("../app/components/Brand.tsx", import.meta.url), "utf8");
  const [, width, height] = brand.match(/width=\{(\d+)\} height=\{(\d+)\}/);
  assert.ok(Math.abs(Number(width) / Number(height) - badge.width / badge.height) < 0.02, `badge ${badge.width}×${badge.height} drawn ${width}×${height}`);
  assert.deepEqual(await pngSize("icon.png"), { width: 256, height: 256 });
  assert.deepEqual(await pngSize("apple-icon.png"), { width: 180, height: 180 });
  assert.deepEqual(await pngSize("og.png"), { width: 1200, height: 630 });
});
