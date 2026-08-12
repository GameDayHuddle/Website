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
  assert.match(html, /For clubs, leagues &amp; school systems/i);
  assert.match(html, /Your signal can drop/);
  assert.match(html, /application\/ld\+json/);
  assert.doesNotMatch(html, /stadium/i);
  assert.doesNotMatch(html, /Less tapping\. More coaching\./i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/);
});

test("renders customer, admin, and download product surfaces", async () => {
  for (const [path, phrase] of [["/login", "Welcome back"], ["/account?preview=1", "Payment method"], ["/admin?preview=1", "Sales pipeline"], ["/download", "Download Android beta"]]) {
    const response = await render(path);
    assert.equal(response.status, 200);
    assert.match(await response.text(), new RegExp(phrase, "i"));
  }
});

test("all exported navigation targets and page anchors resolve", async () => {
  const routeRequests = new Map([
    ["/", "/"],
    ["/about", "/about"],
    ["/pricing", "/pricing"],
    ["/download", "/download"],
    ["/login", "/login"],
    ["/privacy", "/privacy"],
    ["/terms", "/terms"],
    ["/account", "/account?preview=1"],
    ["/admin", "/admin?preview=1"],
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
  const [home, account] = await Promise.all([
    render("/").then((response) => response.text()),
    render("/account?preview=1").then((response) => response.text()),
  ]);

  assert.match(home, /<a[^>]+href="\/download"[^>]*>Start free trial<\/a>/);
  assert.doesNotMatch(home, /<button[^>]*>Call play/);
  assert.doesNotMatch(account, /<button[^>]*>(Manage|Invite|View all|Download PDF)<\/button>/);
  assert.match(account, /mailto:support@gamedayhuddle\.com\?subject=Request%20secure%20billing%20portal/);
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

test("ships production assets and removes the starter preview", async () => {
  const [packageJson] = await Promise.all([readFile(new URL("../package.json", import.meta.url), "utf8"), access(new URL("../public/og.png", import.meta.url)), access(new URL("../public/downloads/GameDay-Huddle-0.1.0-beta.apk", import.meta.url))]);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
});
