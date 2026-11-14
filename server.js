/* ============================================================
   深度搜索 DeepSou · 后端服务
   - 静态文件托管(多文件页面)
   - /api/search  转发 DeepSeek 网页搜索 API(服务器端持有 Key)
   - /api/config  查询/保存/清除服务器端配置(Key 永不返回)
   - /api/test    测试检索接口连通性
   - /api/health  健康检查(部署探活用)
   配置存储:config.json(已加入 .gitignore),或用环境变量
   DEEPSO_KEY / DEEPSO_BASE 预置。
   ============================================================ */
"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const CONFIG_FILE = path.join(ROOT, "config.json");
const DEFAULT_BASE = "https://api.deepseek.com";

/* ---------- 配置读写(Key 只存在服务端) ---------- */
function loadConfig() {
  let file = {};
  try {
    file = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
  } catch (_) { /* 无配置文件,回落环境变量 */ }
  const key = String(process.env.DEEPSO_KEY || file.key || "").trim();
  const base = String(process.env.DEEPSO_BASE || file.base || DEFAULT_BASE).trim().replace(/\/+$/, "");
  return { key, base };
}
function saveConfig(cfg) {
  const tmp = CONFIG_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify({ key: cfg.key, base: cfg.base }, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, CONFIG_FILE);
}
function clearConfig() {
  try { fs.unlinkSync(CONFIG_FILE); } catch (_) { /* 不存在则忽略 */ }
}

/* ---------- 小工具 ---------- */
function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > 64 * 1024) { reject(new Error("请求体过大")); req.destroy(); return; }
      raw += c;
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch (_) { reject(new Error("请求体不是合法 JSON")); }
    });
    req.on("error", reject);
  });
}
function maskKey(k) {
  if (!k) return "";
  if (k.length <= 8) return "********";
  return k.slice(0, 4) + "****" + k.slice(-4);
}

/* ---------- 转发 DeepSeek 搜索 API ---------- */
async function proxySearch(query, count) {
  const cfg = loadConfig();
  if (!cfg.key) {
    const err = new Error("尚未配置 API Key,请先在「API 设置」中填写。");
    err.code = "NOT_CONFIGURED";
    throw err;
  }
  const t0 = Date.now();
  let upstream;
  try {
    upstream = await fetch(cfg.base + "/v1/tools/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + cfg.key },
      body: JSON.stringify({ query, count, need_content: false }),
      signal: AbortSignal.timeout(20000)
    });
  } catch (e) {
    const detail = (e.cause && e.cause.message) ? e.cause.message : e.message;
    const err = new Error("无法连接上游检索接口(" + detail + ")");
    err.code = "UPSTREAM";
    throw err;
  }
  const text = await upstream.text();
  let data = null;
  try { data = JSON.parse(text); } catch (_) { /* 非 JSON */ }
  if (!upstream.ok || !data || !Array.isArray(data.results)) {
    const msg = (data && data.error && data.error.message) ? data.error.message : ("HTTP " + upstream.status);
    const err = new Error("上游接口错误:" + msg);
    err.code = "UPSTREAM";
    throw err;
  }
  return {
    ok: true,
    took: (Date.now() - t0) / 1000,
    base: cfg.base,
    results: data.results.map((r) => {
      const raw = (typeof r.authority === "number") ? r.authority : -1;
      const score10 = raw >= 0 ? raw / 4 * 10 : (r.rerank_score || 0) / 3 * 10;
      let dateStr = "";
      if (r.date) { const m = String(r.date).slice(0, 10); dateStr = /^\d{4}-\d{2}-\d{2}/.test(m) ? m : ""; }
      return {
        title: String(r.title || "未命名网页"),
        url: String(r.url || "#"),
        summary: String(r.snippet || r.summary || ""),
        site: r.site_name ? String(r.site_name) : "",
        date: dateStr,
        score: score10,
        raw
      };
    }).sort((a, b) => b.score - a.score)
  };
}

/* ---------- 路由 ---------- */
const routes = {
  "GET /api/config": async (req, res) => {
    const cfg = loadConfig();
    sendJson(res, 200, {
      configured: !!cfg.key,
      base: cfg.base,
      keyMasked: maskKey(cfg.key),
      envOverride: !!process.env.DEEPSO_KEY
    });
  },

  "POST /api/config": async (req, res) => {
    const body = await readBody(req);
    const key = String(body.key || "").trim();
    let base = String(body.base || "").trim() || DEFAULT_BASE;
    base = base.replace(/\/+$/, "");
    if (!/^https?:\/\/.+/i.test(base)) return sendJson(res, 400, { error: "接口地址必须是 http(s) 链接。" });
    if (key && key.length < 8) return sendJson(res, 400, { error: "API Key 太短,请检查是否复制完整。" });
    const prev = loadConfig();
    const next = { key: key || prev.key, base };
    if (!key && !prev.key) next.key = "";
    saveConfig(next);
    sendJson(res, 200, { ok: true, configured: !!next.key, base: next.base, keyMasked: maskKey(next.key) });
  },

  "DELETE /api/config": async (req, res) => {
    clearConfig();
    sendJson(res, 200, { ok: true, configured: false, base: DEFAULT_BASE, keyMasked: "" });
  },

  "POST /api/search": async (req, res) => {
    const body = await readBody(req);
    const q = String(body.query || "").trim();
    const count = Math.min(Math.max(Number(body.count) || 12, 1), 20);
    if (!q) return sendJson(res, 400, { error: "缺少 query 参数。" });
    try {
      sendJson(res, 200, await proxySearch(q, count));
    } catch (err) {
      if (err.code === "NOT_CONFIGURED") return sendJson(res, 401, { error: err.message, code: "NOT_CONFIGURED" });
      sendJson(res, 502, { error: err.message || "上游检索接口无法连通。" });
    }
  },

  "GET /api/health": async (req, res) => {
    const cfg = loadConfig();
    sendJson(res, 200, { ok: true, configured: !!cfg.key, base: cfg.base, time: new Date().toISOString() });
  },

  "POST /api/test": async (req, res) => {
    try {
      await readBody(req); /* 允许空 body */
      const out = await proxySearch("DeepSeek", 1);
      sendJson(res, 200, { ok: true, took: out.took, base: out.base });
    } catch (err) {
      if (err.code === "NOT_CONFIGURED") return sendJson(res, 401, { error: err.message, code: "NOT_CONFIGURED" });
      sendJson(res, 502, { error: err.message || "上游检索接口无法连通。" });
    }
  }
};

/* ---------- 静态文件 ---------- */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8"
};
function serveStatic(req, res, pathname) {
  if (pathname === "/") pathname = "/index.html";
  const safe = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  let file = path.join(ROOT, safe);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end("Forbidden"); }
  if (path.basename(file) === "config.json") { res.writeHead(403); return res.end("Forbidden"); } /* 密钥文件绝不外发 */
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) {
      /* 尝试加默认扩展名,再退回首页 */
      file = path.join(ROOT, safe + ".html");
      fs.stat(file, (e2, s2) => {
        if (!e2 && s2.isFile()) return pipe(file, res);
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("404 Not Found");
      });
      return;
    }
    pipe(file, res);
  });
  function pipe(f, r) {
    r.writeHead(200, { "Content-Type": MIME[path.extname(f).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(f).pipe(r);
  }
}

/* ---------- 启动 ---------- */
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://localhost");
  const key = req.method + " " + u.pathname;
  try {
    if (routes[key]) return await routes[key](req, res);
    if (req.method === "GET") return serveStatic(req, res, u.pathname);
    sendJson(res, 404, { error: "Not Found" });
  } catch (err) {
    if (!res.headersSent) sendJson(res, 500, { error: "服务器内部错误:" + (err.message || err) });
    else res.end();
  }
});
server.listen(PORT, () => {
  const cfg = loadConfig();
  console.log(`[深度搜索 DeepSou] v6.1 服务已启动: http://0.0.0.0:${PORT}`);
  console.log(`[深度搜索 DeepSou] API Key: ${cfg.key ? "已配置(" + maskKey(cfg.key) + ")" : "未配置(当前为离线演示模式)"}`);
  console.log(`[深度搜索 DeepSou] 接口地址: ${cfg.base}`);
});