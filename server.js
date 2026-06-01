// server.js — tiny zero-dependency local server for `node server.js`.
// Serves the static files and mirrors the /api/* routes exactly like Vercel.
import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  handleContent,
  handleQuestion,
  handlePlayerGet,
  handlePlayerPost,
} from './server/core.js';

const PORT = process.env.PORT || 3000;
const ROOT = process.cwd();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function sendJSON(res, out) {
  res.writeHead(out.status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(out.json));
}

async function readBody(req) {
  return await new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (_) {
        resolve({});
      }
    });
  });
}

async function serveStatic(req, res, pathname) {
  let rel = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(ROOT, decodeURIComponent(rel));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch (_) {
    res.writeHead(404);
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;
  const query = Object.fromEntries(url.searchParams.entries());

  try {
    if (p === '/api/content') return sendJSON(res, handleContent());
    if (p === '/api/question') return sendJSON(res, handleQuestion(query));
    if (p.startsWith('/api/player/')) {
      const name = decodeURIComponent(p.slice('/api/player/'.length));
      if (req.method === 'POST') return sendJSON(res, await handlePlayerPost(name, await readBody(req)));
      return sendJSON(res, await handlePlayerGet(name));
    }
    return serveStatic(req, res, p);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message }));
  }
});

server.listen(PORT, () => {
  console.log(`✨ Magic Maths running at http://localhost:${PORT}`);
});
