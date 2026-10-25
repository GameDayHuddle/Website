import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "pages-out");
const origin = "https://www.gamedayhuddle.com";
const app = "https://app.gamedayhuddle.com";

const pages = [["/", "index.html"]];

// The tablet coaching app's pages, retired with it on 25 Oct 2026. Their addresses are in
// search results and old messages, so each forwards somewhere true instead of a 404. The
// platform's own legal pages live at app.gamedayhuddle.com (docs/store/listing.md §3).
const retired = [
  ["/about", "/"],
  ["/demo", "/#coaching"],
  ["/download", "/"],
  ["/signup", "/"],
  ["/contact", "/"],
  ["/pricing", "/#pricing"],
  ["/login", app],
  ["/account", app],
  ["/admin", "/"],
  ["/privacy", `${app}/privacy`],
  ["/terms", `${app}/terms`],
];

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("github-pages-export", Date.now().toString());
const { default: worker } = await import(workerUrl.href);

const env = {
  ASSETS: {
    fetch: async () => new Response("Not found", { status: 404 }),
  },
};
const context = { waitUntil() {}, passThroughOnException() {} };

async function render(requestPath, destination) {
  const response = await worker.fetch(
    new Request(`${origin}${requestPath}`, { headers: { accept: "text/html" } }),
    env,
    context,
  );

  if (!response.ok) {
    throw new Error(`Unable to export ${requestPath}: ${response.status} ${response.statusText}`);
  }

  const target = path.join(output, destination);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, await response.text(), "utf8");
  console.log(`Exported ${requestPath} -> ${destination}`);
}

async function renderMetadata(requestPath, destination) {
  const response = await worker.fetch(new Request(`${origin}${requestPath}`), env, context);
  if (!response.ok) {
    throw new Error(`Unable to export ${requestPath}: ${response.status} ${response.statusText}`);
  }
  await writeFile(path.join(output, destination), await response.text(), "utf8");
}

const shell = (title, body, head = "") => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title>${head}
<link rel="icon" href="/icon.png"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#06193d;color:#c9d3e3;font:18px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;text-align:center;padding:24px}h1{color:#fff;font-size:32px;margin:16px 0 8px}a{color:#fff;font-weight:700}a.b{display:inline-block;margin-top:24px;padding:16px 26px;border-radius:8px;background:#f45d0a;font-size:19px;text-decoration:none}</style></head>
<body><main><img src="/badge.png" alt="" width="90" height="96">${body}</main></body></html>
`;

async function writeRedirect(from, to) {
  const target = path.join(output, from.slice(1), "index.html");
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(
    target,
    shell(
      "GameDay Huddle",
      `<h1>This page has moved</h1><p><a href="${to}">Continue to GameDay Huddle</a></p>`,
      `<link rel="canonical" href="${to.startsWith("/") ? origin + to : to}"><meta http-equiv="refresh" content="0; url=${to}">`,
    ),
    "utf8",
  );
  console.log(`Forwarded ${from} -> ${to}`);
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, "dist/client"), output, { recursive: true });
await Promise.all(pages.map(([requestPath, destination]) => render(requestPath, destination)));
await Promise.all(retired.map(([from, to]) => writeRedirect(from, to)));
await writeFile(
  path.join(output, "404.html"),
  shell("Page not found | GameDay Huddle", `<h1>We couldn&rsquo;t find that page</h1><p>It may have moved when the site was updated.</p><a class="b" href="/">Go to GameDay Huddle</a>`),
  "utf8",
);
await renderMetadata("/robots.txt", "robots.txt");
await renderMetadata("/sitemap.xml", "sitemap.xml");
await writeFile(path.join(output, "CNAME"), "www.gamedayhuddle.com\n", "utf8");

console.log(`GitHub Pages export ready at ${output}`);
