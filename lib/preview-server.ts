import { execFile } from "node:child_process";
import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
  ".txt": "text/plain; charset=utf-8",
};

function contentTypeFor(filePath: string): string {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

// Next's static export emits routes as sibling ".html" files (e.g. "graph.html"), not
// "graph/index.html" — confirmed against this project's own out/ directory. Try the exact file
// first (real assets under _next/, graph-data.json, etc.), then that convention, then a plain
// index.html fallback for safety.
function resolveFile(siteDir: string, urlPath: string): string | null {
  const resolvedSiteDir = path.resolve(siteDir);
  const decoded = decodeURIComponent(urlPath.split("?")[0] ?? "/");
  const cleanPath = decoded === "/" ? "/index.html" : decoded;

  const candidates = [
    path.join(resolvedSiteDir, cleanPath),
    path.join(resolvedSiteDir, `${cleanPath}.html`),
    path.join(resolvedSiteDir, cleanPath, "index.html"),
  ];

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    const relative = path.relative(resolvedSiteDir, resolved);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      // Path traversal attempt (e.g. "../../etc/passwd") — skip, never serve outside siteDir.
      continue;
    }
    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
      return resolved;
    }
  }

  return null;
}

export interface PreviewServerOptions {
  siteDir: string;
  port: number;
}

export function startPreviewServer({ siteDir, port }: PreviewServerOptions): http.Server {
  const server = http.createServer((req, res) => {
    const filePath = resolveFile(siteDir, req.url ?? "/");

    if (filePath) {
      res.writeHead(200, { "Content-Type": contentTypeFor(filePath) });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    const notFoundPath = path.join(siteDir, "404.html");
    if (fs.existsSync(notFoundPath)) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      fs.createReadStream(notFoundPath).pipe(res);
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
  });

  server.listen(port);
  return server;
}

// Best-effort only. A visitor can always use the printed URL instead, so a failure here (missing
// "open"/"xdg-open" on an unusual Linux setup, etc.) must never be fatal.
export function openInBrowser(url: string): void {
  try {
    if (process.platform === "win32") {
      execFile("cmd.exe", ["/c", "start", "", url]);
    } else if (process.platform === "darwin") {
      execFile("open", [url]);
    } else {
      execFile("xdg-open", [url]);
    }
  } catch {
    // Ignored — see comment above.
  }
}
