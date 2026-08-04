import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const LOGIN_API_URL = process.env.LOGIN_API_URL || "https://stocktraders.vn/service/data/getUserLogin";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "okr-login-proxy",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
          if (req.method !== "POST" || url.pathname !== "/api/login") {
            next();
            return;
          }

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
            res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ error: error?.message || "Login proxy failed" }));
          }
        });
      },
    },
  ],
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