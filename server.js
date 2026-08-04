import { createReadStream, existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildTraders } from "./src/utils/okr.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 5175);
const HOST = process.env.HOST || "0.0.0.0";
const DIST_DIR = path.join(__dirname, "dist");
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DB_FILE = process.env.DB_FILE || path.join(DATA_DIR, "okr-db.json");
const LOGIN_API_URL = process.env.LOGIN_API_URL || "https://stocktraders.vn/service/data/getUserLogin";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendText(res, status, message) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(message);
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function handleLogin(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (req.method !== "POST" || url.pathname !== "/api/login") return false;

  try {
    const body = await readRequestBody(req);
    const upstream = await fetch(LOGIN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body,
    });

    const text = await upstream.text();
    res.writeHead(upstream.status, {
      "Content-Type": upstream.headers.get("content-type") || "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(text);
  } catch (error) {
    sendJson(res, 502, { error: error?.message || "Login proxy failed" });
  }

  return true;
}

async function handleOkrState(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (url.pathname !== "/api/okr-state") return false;

  if (req.method === "GET") {
    const year = Number(url.searchParams.get("year") || 2026);
    const month = Number(url.searchParams.get("month") || 7);
    const db = readDb();
    const state = ensureMonthState(db, year, month);
    writeDb(db);
    sendJson(res, 200, state);
    return true;
  }

  if (req.method === "PUT") {
    try {
      const payload = await readJsonRequest(req);
      const year = Number(payload?.year);
      const month = Number(payload?.month);
      const traders = payload?.traders;

      if (!Number.isInteger(year) || !Number.isInteger(month) || month < 0 || month > 11 || !Array.isArray(traders)) {
        sendJson(res, 400, { error: "Invalid OKR state payload" });
        return true;
      }

      const db = readDb();
      const state = { year, month, traders };
      db.months[monthKey(year, month)] = state;
      writeDb(db);
      sendJson(res, 200, { ok: true, ...state });
    } catch (error) {
      sendJson(res, 400, { error: error?.message || "Invalid request body" });
    }

    return true;
  }

  sendText(res, 405, "Method not allowed");
  return true;
}

function readDb() {
  if (!existsSync(DB_FILE)) return { version: 1, months: {} };

  try {
    const db = JSON.parse(readFileSync(DB_FILE, "utf8"));
    return { version: 1, months: {}, ...db, months: db.months || {} };
  } catch {
    return { version: 1, months: {} };
  }
}

function writeDb(db) {
  mkdirSync(DATA_DIR, { recursive: true });
  const tempFile = `${DB_FILE}.tmp`;
  writeFileSync(tempFile, JSON.stringify(db, null, 2), "utf8");
  renameSync(tempFile, DB_FILE);
}

function ensureMonthState(db, year, month) {
  const key = monthKey(year, month);
  if (!db.months[key]) {
    db.months[key] = { year, month, traders: buildTraders(year, month) };
  }
  return db.months[key];
}

function monthKey(year, month) {
  return `${year}-${month}`;
}

async function readJsonRequest(req) {
  const body = await readRequestBody(req);
  return body ? JSON.parse(body) : {};
}

function serveStatic(req, res) {
  if (!existsSync(DIST_DIR)) {
    sendText(res, 404, "dist not found. Run npm run build first.");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(url.pathname);
  const requestedPath = pathname === "/" || !path.extname(pathname) ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(DIST_DIR, requestedPath));

  if (!filePath.startsWith(DIST_DIR)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    sendText(res, 404, "Not found");
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, {
    "Content-Type": contentTypes[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=31536000, immutable",
  });
  createReadStream(filePath).pipe(res);
}

createServer(async (req, res) => {
  if (await handleLogin(req, res)) return;
  if (await handleOkrState(req, res)) return;

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }

  sendText(res, 405, "Method not allowed");
}).listen(PORT, HOST, () => {
  console.log(`OKR Trader web server listening on http://${HOST}:${PORT}`);
});

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}
