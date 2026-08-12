import { createReadStream, existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import initSqlJs from "sql.js";
import { buildTraders } from "./src/utils/okr.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 5175);
const HOST = process.env.HOST || "0.0.0.0";
const DIST_DIR = path.join(__dirname, "dist");
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DB_FILE = process.env.DB_FILE || path.join(DATA_DIR, "okr.db");
const LEGACY_DB_FILE = path.join(DATA_DIR, "okr-db.json");
const LOGIN_API_URL = process.env.LOGIN_API_URL || "https://stocktraders.vn/service/data/getUserLogin";
const CHECK_ACCOUNT_API_URL = process.env.CHECK_ACCOUNT_API_URL || "https://stocktraders.vn/service/data/getCheckAcount";
const DAY_KEYS = new Set(["invite", "friend", "comm", "priv", "portrait", "post", "port", "nav", "report"]);
const sqlReady = initSqlJs({
  locateFile: (filename) => path.join(__dirname, "node_modules", "sql.js", "dist", filename),
});

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

async function handleCheckAccount(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (req.method !== "POST" || url.pathname !== "/api/check-account") return false;

  try {
    const payload = await readJsonRequest(req);
    const account = String(payload?.account || "").trim();

    if (!account) {
      sendJson(res, 400, { error: "Account is required" });
      return true;
    }

    const upstream = await fetch(CHECK_ACCOUNT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        CheckAcountRequest: { account },
      }),
    });

    const text = await upstream.text();
    res.writeHead(upstream.status, {
      "Content-Type": upstream.headers.get("content-type") || "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(text);
  } catch (error) {
    sendJson(res, 502, { error: error?.message || "Check account proxy failed" });
  }

  return true;
}
async function handleOkrState(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (url.pathname !== "/api/okr-state") return false;

  if (req.method === "GET") {
    const year = Number(url.searchParams.get("year") || 2026);
    const month = Number(url.searchParams.get("month") || 7);

    try {
      const db = await openDb();
      const state = readMonthState(db, year, month);
      saveDb(db);
      sendJson(res, 200, state);
    } catch (error) {
      sendJson(res, 500, { error: error?.message || "Cannot read OKR state" });
    }

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

      const db = await openDb();
      const existingState = readMonthState(db, year, month);
      const state = {
        year,
        month,
        traders: mergeExistingDayValues(existingState.traders, traders),
      };
      writeMonthState(db, state);
      saveDb(db);
      sendJson(res, 200, { ok: true, ...state });
    } catch (error) {
      sendJson(res, 400, { error: error?.message || "Cannot save OKR state" });
    }

    return true;
  }

  sendText(res, 405, "Method not allowed");
  return true;
}

async function handleOkrDay(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (req.method !== "PATCH" || url.pathname !== "/api/okr-day") return false;

  try {
    const payload = await readJsonRequest(req);
    const year = Number(payload?.year);
    const month = Number(payload?.month);
    const traderId = String(payload?.traderId || "");
    const date = String(payload?.date || "");
    const key = String(payload?.key || "");
    const value = Number(payload?.value) || 0;

    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 0 || month > 11 || !traderId || !date || !DAY_KEYS.has(key)) {
      sendJson(res, 400, { error: "Invalid OKR day payload" });
      return true;
    }

    const db = await openDb();
    const state = readMonthState(db, year, month);
    const trader = state.traders.find((item) => item.id === traderId);

    if (!trader) {
      saveDb(db);
      sendJson(res, 404, { error: "Trader not found" });
      return true;
    }

    const day = (trader.days || []).find((item) => item.date === date);

    if (!day) {
      saveDb(db);
      sendJson(res, 404, { error: "Day not found" });
      return true;
    }

    day[key] = value;
    writeMonthState(db, state);
    saveDb(db);
    sendJson(res, 200, { ok: true, year, month, traderId, date, key, value });
  } catch (error) {
    sendJson(res, 400, { error: error?.message || "Cannot save OKR day" });
  }

  return true;
}
async function openDb() {
  mkdirSync(DATA_DIR, { recursive: true });
  const SQL = await sqlReady;
  const db = existsSync(DB_FILE) ? new SQL.Database(readFileSync(DB_FILE)) : new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS okr_months (
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      traders_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (year, month)
    )
  `);

  if (!existsSync(DB_FILE) && existsSync(LEGACY_DB_FILE)) {
    migrateLegacyJson(db);
  }

  return db;
}

function saveDb(db) {
  const tempFile = `${DB_FILE}.tmp`;
  writeFileSync(tempFile, Buffer.from(db.export()));
  renameSync(tempFile, DB_FILE);
  db.close();
}

function readMonthState(db, year, month) {
  const stmt = db.prepare("SELECT traders_json FROM okr_months WHERE year = ? AND month = ?");

  try {
    stmt.bind([year, month]);

    if (stmt.step()) {
      return {
        year,
        month,
        traders: JSON.parse(stmt.getAsObject().traders_json),
      };
    }
  } finally {
    stmt.free();
  }

  const state = { year, month, traders: buildTraders(year, month) };
  writeMonthState(db, state);
  return state;
}

function writeMonthState(db, { year, month, traders }) {
  db.run(
    `INSERT OR REPLACE INTO okr_months (year, month, traders_json, updated_at)
     VALUES (?, ?, ?, ?)`,
    [year, month, JSON.stringify(traders), new Date().toISOString()],
  );
}

function normalizeUpdateStamp(value) {
  const stamp = Number(value);
  return Number.isFinite(stamp) && stamp > 0 ? stamp : Date.now() * 1000;
}
function mergeExistingDayValues(existingTraders, incomingTraders) {
  const existingByTraderId = new Map((existingTraders || []).map((trader) => [trader.id, trader]));

  return incomingTraders.map((incomingTrader) => {
    const existingTrader = existingByTraderId.get(incomingTrader.id);
    if (!existingTrader?.days?.length || !incomingTrader?.days?.length) return incomingTrader;

    const existingDaysByDate = new Map(existingTrader.days.map((day) => [day.date, day]));
    const days = incomingTrader.days.map((incomingDay) => {
      const existingDay = existingDaysByDate.get(incomingDay.date);
      if (!existingDay) return incomingDay;

      const mergedDay = { ...incomingDay };
      DAY_KEYS.forEach((key) => {
        if (existingDay[key] !== undefined && existingDay[key] !== null) mergedDay[key] = existingDay[key];
      });
      return mergedDay;
    });

    return { ...incomingTrader, days };
  });
}
function migrateLegacyJson(db) {
  try {
    const legacy = JSON.parse(readFileSync(LEGACY_DB_FILE, "utf8"));

    Object.values(legacy?.months || {}).forEach((state) => {
      if (Number.isInteger(Number(state?.year)) && Number.isInteger(Number(state?.month)) && Array.isArray(state?.traders)) {
        writeMonthState(db, {
          year: Number(state.year),
          month: Number(state.month),
          traders: state.traders,
        });
      }
    });
  } catch {
    // Ignore malformed legacy data and let the app create the default month state.
  }
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
  if (await handleCheckAccount(req, res)) return;
  if (await handleOkrDay(req, res)) return;
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
