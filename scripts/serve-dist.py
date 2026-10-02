#!/usr/bin/env python3
"""
Mimics GitHub Pages' static serving behaviour to verify real HTTP responses:
  - directory index:  /about/  -> about/index.html   (200)
  - unknown path:               -> 404.html           (404 status)
  - robots.txt / sitemap.xml    -> served at the root (200)
"""
import http.server
import os
import socketserver
import sys

DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "dist")
PORT = 8099

TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ico": "image/x-icon",
}


class Handler(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *a):
        pass

    def _send(self, status, path, body):
        ext = os.path.splitext(path)[1]
        ctype = TYPES.get(ext, "application/octet-stream")
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        url = self.path.split("?")[0].split("#")[0]
        rel = url.lstrip("/")

        # Normalise: /about -> /about/ (GitHub Pages issues a 301)
        if rel and not rel.endswith("/") and os.path.isdir(os.path.join(DIST, rel)):
            self.send_response(301)
            self.send_header("Location", "/" + rel + "/")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return

        candidates = []
        if rel.endswith("/"):
            candidates.append(os.path.join(rel, "index.html"))
        else:
            candidates.append(rel)
            candidates.append(os.path.join(rel, "index.html"))
            candidates.append(rel + "/index.html")

        for c in candidates:
            full = os.path.join(DIST, c)
            if os.path.isfile(full):
                with open(full, "rb") as fh:
                    self._send(200, full, fh.read())
                return

        # Unknown path -> real 404 status with the 404 page body
        full = os.path.join(DIST, "404.html")
        if os.path.isfile(full):
            with open(full, "rb") as fh:
                self._send(404, full, fh.read())
            return
        self._send(404, "none", b"Not Found")


class Server(socketserver.TCPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    with Server(("127.0.0.1", port), Handler) as httpd:
        print(f"serving {DIST} on http://127.0.0.1:{port}", flush=True)
        httpd.serve_forever()