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

test("server-renders the GameDay Huddle marketing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /GameDay Huddle/);
  assert.match(html, /Build the playbook/);
  assert.match(html, /The sideline operating system/);
  assert.match(html, /FOR MULTI-TEAM PROGRAMS/i);
  assert.match(html, /Your signal can drop/);
  assert.match(html, /Get the Android app/);
  assert.match(html, /application\/ld\+json/);
  // The playable demo server-renders its opening state: an empty log, the ball on the
  // 25, and a playbook to call from.
  assert.match(html, /id="demo"/);
  assert.match(html, /Record a drive/);
  assert.match(html, /THE EVENT LOG/);
  assert.match(html, /1st &amp; 10/);
  assert.match(html, /Own 25/);
  assert.match(html, /Power Right/);
  assert.match(html, /Nothing recorded yet/);
  assert.doesNotMatch(html, /Get the Android beta/i);
  assert.doesNotMatch(html, /stadium/i);
  assert.doesNotMatch(html, /Less tapping\. More coaching\./i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/);
});

test("download page carries release copy instead of beta copy", async () => {
  const response = await render("/download");
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const phrase of [
    "Download GameDay Huddle <span",
    "What(?:'|&#x27;|&#39;)s new in",
    "Install the app",
    "Hear about updates",
    "Direct install",
    "Request an invite",
  ]) assert.match(html, new RegExp(phrase, "i"));
  for (const phrase of [
    "Download GameDay Huddle beta",
    // The Play Keeper is a seat inside the app now, not a second installer.
    "Download Play Keeper",
    "Install the beta",
    "Join the beta group",
    "Android beta",
    "Beta note",
    "testing build",
  ]) assert.doesNotMatch(html, new RegExp(phrase, "i"));
});

test("signup page renders a working account form instead of the opens-soon banner", async () => {
  const response = await render("/signup");
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const phrase of [
    "Choose Coach Only",
    "Choose Organization",
    "Team name",
    "Your name",
    "Email",
    "Password",
    "Access code \\(optional\\)",
    "covers your first year",
    "<noscript",
    "<form",
  ]) assert.match(html, new RegExp(phrase, "i"));
  assert.doesNotMatch(html, /Account creation opens soon/i);
  assert.doesNotMatch(html, /<button[^>]*\sdisabled/i);
});

test("the Live Demo page renders the playable recorder", async () => {
  const response = await render("/demo");
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const phrase of [
    "Live Demo",
    "Call a play",
    "THE EVENT LOG",
    "1st &amp; 10",
    "Own 25",
    "Power Right",
    "Nothing recorded yet",
    "What this demo is not",
  ]) assert.match(html, new RegExp(phrase, "i"));
  // The tab is in the primary navigation on every page, not just this one.
  const home = await render("/").then((page) => page.text());
  assert.match(home, /href="\/demo"[^>]*>Live Demo</);
});

test("all exported navigation targets and page anchors resolve", async () => {
  const routeRequests = new Map([
    ["/", "/"],
    ["/demo", "/demo"],
    ["/about", "/about"],
    ["/pricing", "/pricing"],
    ["/download", "/download"],
    ["/signup", "/signup"],
    ["/privacy", "/privacy"],
    ["/terms", "/terms"],
  ]);
  const htmlByRoute = new Map();

  for (const [route, requestPath] of routeRequests) {
    const response = await render(requestPath);
    assert.equal(response.status, 200, `${route} should render`);
    htmlByRoute.set(route, await response.text());
  }

  for (const [route, html] of htmlByRoute) {
    const hrefs = [...html.matchAll(/\shref="([^"]+)"/g)].map((match) => match[1].replaceAll("&amp;", "&"));
    for (const href of hrefs) {
      if (!href.startsWith("/") && !href.startsWith("#")) continue;
      if (href.startsWith("/_next/")) continue;

      const [rawPath, hash] = href.split("#");
      const targetPath = rawPath || route;
      if (/\.[a-z0-9]+$/i.test(targetPath)) {
        await access(new URL(`../public${targetPath}`, import.meta.url));
        continue;
      }
      assert.ok(routeRequests.has(targetPath), `${route} links to an unexported route: ${href}`);
      if (hash) assert.match(htmlByRoute.get(targetPath), new RegExp(`\\sid="${hash}"`), `${href} should have a matching target`);
    }
  }
});

test("static hosting renders working fallbacks instead of dead controls", async () => {
  const home = await render("/").then((response) => response.text());

  // Without a checkout API configured, both plan buttons fall back to sign-up
  // rather than rendering a dead control (or implying the plan is free).
  assert.match(home, /<a[^>]+href="\/signup"[^>]*>Get Coach<\/a>/);
  assert.match(home, /<a[^>]+href="\/signup"[^>]*>Get Organization<\/a>/);
  assert.doesNotMatch(home, /<button[^>]*>Call play/);
});

test("homepage includes the supplied app's Game Day and offensive analytics views", async () => {
  const response = await render("/");
  const html = await response.text();
  const productScreens = await readFile(new URL("../app/components/ProductScreens.tsx", import.meta.url), "utf8");

  assert.match(html, /Game Day home/);
  assert.match(html, /Offensive analytics/);
  assert.match(html, /Riverside vs Northgate/);
  assert.match(productScreens, /Where our carries are going/);
  assert.match(productScreens, /Power Right/);
  assert.match(productScreens, /Yards \/ play/);
});

test("homepage ships the coach product tour and accessible media assets", async () => {
  const response = await render("/");
  const html = await response.text();

  assert.match(html, /id="product-tour"/);
  assert.match(html, /gameday-huddle-product-overview\.mp4/);
  assert.match(html, /gameday-huddle-product-overview-poster\.jpg/);
  assert.match(html, /gameday-huddle-product-overview-en\.vtt/);
  await Promise.all([
    access(new URL("../public/media/gameday-huddle-product-overview.mp4", import.meta.url)),
    access(new URL("../public/media/gameday-huddle-product-overview-poster.jpg", import.meta.url)),
    access(new URL("../public/media/gameday-huddle-product-overview-en.vtt", import.meta.url)),
  ]);
});

test("ships production assets and removes the starter preview", async () => {
  const manifest = JSON.parse(await readFile(new URL("../app/download/manifest.json", import.meta.url), "utf8"));
  const [packageJson] = await Promise.all([readFile(new URL("../package.json", import.meta.url), "utf8"), access(new URL("../public/og.png", import.meta.url)), access(new URL(`../public/downloads/${manifest.huddle.file}`, import.meta.url))]);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
});
