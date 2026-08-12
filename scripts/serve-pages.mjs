import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../pages-out");
const port = Number(process.env.PORT ?? 4173);
const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".xml", "application/xml; charset=utf-8"],
  [".apk", "application/vnd.android.package-archive"],
]);

async function resolveFile(urlPath) {
  const decodedPath = decodeURIComponent(urlPath).replace(/^\/+/, "");
  const direct = path.resolve(root, decodedPath);
  if (!direct.startsWith(root)) return null;

  for (const candidate of [direct, path.join(direct, "index.html")]) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {
      // Try the directory index before returning a 404.
    }
  }
  return null;
}

createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  const file = await resolveFile(url.pathname === "/" ? "/index.html" : url.pathname);
  if (!file) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const body = await readFile(file);
  response.writeHead(200, {
    "content-type": mimeTypes.get(path.extname(file).toLowerCase()) ?? "application/octet-stream",
    "content-length": body.length,
  });
  response.end(request.method === "HEAD" ? undefined : body);
}).listen(port, "127.0.0.1", () => {
  console.log(`GitHub Pages preview: http://127.0.0.1:${port}`);
});
