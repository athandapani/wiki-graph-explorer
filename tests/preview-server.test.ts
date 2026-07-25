import * as fs from "node:fs";
import * as http from "node:http";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { startPreviewServer } from "../lib/preview-server";

function get(port: number, urlPath: string): Promise<{ status: number; body: string; contentType: string | undefined }> {
  return new Promise((resolve, reject) => {
    http
      .get(`http://127.0.0.1:${port}${urlPath}`, (res) => {
        let body = "";
        res.on("data", (chunk: Buffer) => {
          body += chunk.toString();
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode ?? 0,
            body,
            contentType: res.headers["content-type"],
          });
        });
      })
      .on("error", reject);
  });
}

describe("preview server", () => {
  let containerDir: string;
  let siteDir: string;
  let server: http.Server;
  let port: number;

  beforeEach(async () => {
    containerDir = fs.mkdtempSync(path.join(os.tmpdir(), "wge-preview-"));
    siteDir = path.join(containerDir, "site");
    fs.mkdirSync(siteDir);
    fs.writeFileSync(path.join(siteDir, "index.html"), "<html>home</html>");
    fs.writeFileSync(path.join(siteDir, "graph.html"), "<html>graph</html>");
    fs.writeFileSync(path.join(siteDir, "graph-data.json"), '{"nodes":[],"edges":[]}');
    fs.writeFileSync(path.join(siteDir, "404.html"), "<html>not found</html>");
    fs.writeFileSync(path.join(containerDir, "outside-site.txt"), "should never be served");

    server = startPreviewServer({ siteDir, port: 0 });
    await new Promise<void>((resolve) => server.once("listening", () => resolve()));
    const address = server.address();
    if (address === null || typeof address === "string") {
      throw new Error("expected an AddressInfo from the preview server");
    }
    port = address.port;
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    fs.rmSync(containerDir, { recursive: true, force: true });
  });

  it("serves index.html for /", async () => {
    const { status, body, contentType } = await get(port, "/");
    expect(status).toBe(200);
    expect(body).toBe("<html>home</html>");
    expect(contentType).toContain("text/html");
  });

  it("serves <route>.html for an extension-less route, matching Next's static export convention", async () => {
    const { status, body } = await get(port, "/graph");
    expect(status).toBe(200);
    expect(body).toBe("<html>graph</html>");
  });

  it("serves an existing file directly with the correct content type", async () => {
    const { status, body, contentType } = await get(port, "/graph-data.json");
    expect(status).toBe(200);
    expect(body).toBe('{"nodes":[],"edges":[]}');
    expect(contentType).toContain("application/json");
  });

  it("serves 404.html with a 404 status for an unknown path", async () => {
    const { status, body } = await get(port, "/does-not-exist");
    expect(status).toBe(404);
    expect(body).toBe("<html>not found</html>");
  });

  it("never serves a file outside siteDir via a path-traversal attempt", async () => {
    const { status, body } = await get(port, "/../outside-site.txt");
    expect(body).not.toContain("should never be served");
    expect(status).toBe(404);
  });
});
