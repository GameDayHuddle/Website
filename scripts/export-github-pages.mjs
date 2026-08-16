import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "pages-out");
const origin = "https://www.gamedayhuddle.com";

const pages = [
  ["/", "index.html"],
  ["/about", "about/index.html"],
  ["/demo", "demo/index.html"],
  ["/pricing", "pricing/index.html"],
  ["/download", "download/index.html"],
  ["/signup", "signup/index.html"],
  ["/privacy", "privacy/index.html"],
  ["/terms", "terms/index.html"],
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

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, "dist/client"), output, { recursive: true });
await Promise.all(pages.map(([requestPath, destination]) => render(requestPath, destination)));
await renderMetadata("/robots.txt", "robots.txt");
await renderMetadata("/sitemap.xml", "sitemap.xml");
await writeFile(path.join(output, "CNAME"), "www.gamedayhuddle.com\n", "utf8");

console.log(`GitHub Pages export ready at ${output}`);
