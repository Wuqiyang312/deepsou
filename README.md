# DeepSou 深度搜索

**English** | [简体中文](README.zh-CN.md)

A nostalgic, early-internet-style search engine backed by the **DeepSeek Web Search API** (`POST /v1/tools/search`). The browser never touches your API key: a tiny dependency-free Node backend holds the key server-side and proxies every request. No AI chat involved — it simply searches the real web and ranks results by authority.

```
        ┌──────────────────────────────────────────────┐
        │  深度搜索 DeepSou · est. 1998 (revived 2026)  │
        │  ┌──────────────────────────┐  ┌────────┐    │
        │  │  what were dinosaurs…    │  │ 深度搜索 │    │
        │  └──────────────────────────┘  └────────┘    │
        └──────────────────────────────────────────────┘
```

## Features

- **Retro 2009-Baidu-style homepage** — blue serif logo, tab row above a wide search box, plain square buttons, footer copyright line. Multi-file static frontend (no build step, no framework).
- **Backend proxy** — all search and test requests go through your own server (`POST /api/search`, `POST /api/test`); the DeepSeek key lives in server-side `config.json` (gitignored) or in `DEEPSO_KEY` / `DEEPSO_BASE` env vars, and is never sent to the browser.
- **Real web search** — forwards to the DeepSeek Search API (`/v1/tools/search`). No AI summarization, no chat completions: the results are actual web pages.
- **Authority ranking** — results are sorted by the API's `authority` field (0–4), displayed as a 0–10 score bar (falls back to `rerank_score` when authority is unknown).
- **"I'm feeling lucky"** — jumps straight to the top-ranked result.
- **Offline demo mode** — without a configured key, the site serves built-in local demo results so it still works out of the box.
- **Extras** — categorized directory (Yahoo-style), guestbook, CRT night mode, Baidu-style 2009 layout.

## Quick Start

```bash
node server.js
# open http://localhost:3000
```

or with Docker:

```bash
docker build -t deepsou .
docker run -p 3000:3000 -e DEEPSO_KEY=sk-... deepsou
```

Then open **API 设置** in the footer links, paste your DeepSeek key, save and test.

## Configuration

Server-side, one of:

| Method | How |
| --- | --- |
| Web UI | Footer link **API 设置** → save (writes `config.json`) |
| Env vars | `DEEPSO_KEY`, `DEEPSO_BASE` (override `config.json`) |
| File | `config.json` next to `server.js`: `{ "key": "sk-...", "base": "https://api.deepseek.com" }` |

`config.json` is **gitignored** — the key never reaches the repository. The browser can only read `{ configured, base, keyMasked }` from `GET /api/config`.

## Backend API

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/search` | POST | Body `{ query, count }` → proxied DeepSeek search, normalized + sorted results |
| `/api/test` | POST | Connectivity check (one real query: "DeepSeek") |
| `/api/config` | GET | `{ configured, base, keyMasked }` — never exposes the key |
| `/api/config` | POST | Save `{ key, base }` to `config.json` |
| `/api/config` | DELETE | Clear the stored key |

Errors: `401` = key not configured; `502` = upstream failure.

## How Results Are Ranked

DeepSeek Search API returns `authority` (0–4, -1 = unknown) per result. DeepSou maps it to a 0–10 display score:

```
score = authority >= 0 ? authority / 4 * 10 : rerank_score / 3 * 10
```

Results are sorted by score, descending. The green bar under each result shows the score.

## Upstream API Reference

- Endpoint: `POST {base}/v1/tools/search`
- Request: `{ "query": "...", "count": 12, "need_content": false }`
- Response: `results[]` with `title`, `url`, `snippet`, `site_name`, `date`, `authority`, `rerank_score`
- Docs: https://api-docs.deepseek.com/zh-cn/api/search.md

## Project Layout

```
server.js        Node backend (static hosting + API proxy, zero deps)
index.html       Homepage (2009 Baidu style)
results.html     Search results page
dir.html         Category directory
guestbook.html   Guestbook
settings.html    API settings page
about.html       About / privacy / tech notes
css/  js/        Styles and per-page scripts
Dockerfile       All-in-one image
config.json      Server-side key file (gitignored)
```

## Privacy

- No tracking, no analytics, no request logging.
- The API key stays on the server; the browser only talks to your own backend.

## License

MIT
