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

test("ships production assets and removes the starter preview", async () => {
  const [packageJson] = await Promise.all([readFile(new URL("../package.json", import.meta.url), "utf8"), access(new URL("../public/og.png", import.meta.url)), access(new URL("../public/downloads/GameDay-Huddle-0.1.0-beta.apk", import.meta.url))]);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
});
