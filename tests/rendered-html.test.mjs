import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
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

test("the home page sells the platform: registration, messaging and fundraising for football and cheer", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /Run your football organization/);
  assert.match(html, /Not ten different apps/);
  assert.match(html, /Everything your program needs to run smoothly/);
  assert.match(html, /application\/ld\+json/);
  // Doug's nine, 25 Oct 2026 — every one has a place on the page.
  for (const feature of [
    "Tackle, flag and cheer",
    "Online Registration",
    "Document Management",
    "Birth certificate",
    "Parent code of conduct",
    "Equipment refund authorization",
    "Equipment Management",
    "Fundraising",
    "Playbook creation",
    "In-game analytics",
    "Jamboree scheduling",
    "Team Messaging",
  ]) assert.match(html, new RegExp(feature, "i"), feature);
});

test("the coaching tools are shown as coming, not as live", async () => {
  const html = await (await render()).text();
  const coaching = html.slice(html.indexOf('id="coaching"'), html.indexOf('id="pricing"'));
  assert.ok(coaching.length > 0, "the coaching section renders before pricing");
  assert.equal(coaching.match(/Coming soon · free/g)?.length, 3);
  // The closed decision survives the pivot: team numbers, never a child's statistics.
  assert.match(coaching, /never player statistics/);
});

// Doug's ruling of 4 Oct 2026: the platform's price could change, so no public page names it.
// The page's only dollar figures are the sample registration fees and raffle totals in the
// pictures; none of them is followed by "per" anything.
test("no price figure is public, and no fee mechanics either", async () => {
  const html = await (await render()).text();
  assert.doesNotMatch(html, /\$\s?\d[\d,.]*\s*(?:per|a|an|each|\/)\s+(?:athlete|registration|player|child|season|month|team)/i);
  assert.doesNotMatch(html, /per (?:athlete )?registration/i);
  assert.doesNotMatch(html, /platform fee|application fee/i);
  assert.match(html, /<b>Free<\/b><span>for families/);
  assert.match(html, /No fee on fundraising/);
  assert.match(html, /No paid add-ons/);
  assert.match(html, /href="mailto:doug@gamedayhuddle\.com\?subject=GameDay%20Huddle%20pricing"/);
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
  assert.doesNotMatch(readme, /\$\s?\d/);
});

test("every way out goes to the live platform, never to the tablet app's doors", async () => {
  const html = await (await render()).text();
  assert.match(html, /href="https:\/\/app\.gamedayhuddle\.com"/);
  for (const page of ["privacy", "terms", "support", "delete-account"]) {
    assert.match(html, new RegExp(`href="https://app\\.gamedayhuddle\\.com/${page}"`), page);
  }
  assert.match(html, /href="mailto:doug@gamedayhuddle\.com\?subject=GameDay%20Huddle%20demo"/);
  for (const gone of [
    /href="\/(?:download|signup|login|account|demo|about|contact)"/,
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

test("the brand files the page names are shipped", async () => {
  for (const file of ["badge.png", "icon.png", "apple-icon.png", "og.png"]) {
    await access(new URL(`../public/${file}`, import.meta.url));
  }
});
