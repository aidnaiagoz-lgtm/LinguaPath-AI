/* Minimal static server for the prototype (used by Playwright and `npm run serve`).
 * Serves only files inside website/; no directory listing, no path traversal. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', 'website');
const PORT = Number(process.env.PORT) || 4173;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.resolve(ROOT, '.' + pathname);
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, body) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(body);
  });
}).listen(PORT, '127.0.0.1', () => console.log(`LinguaPath AI: http://127.0.0.1:${PORT}`));
