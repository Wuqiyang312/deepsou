# DeepSou 深搜

**English** | [简体中文](README.zh-CN.md)

A nostalgic, early-internet-style search engine that connects to the **DeepSeek Web Search API** (`POST /v1/tools/search`) — a pure frontend, single-file HTML page, no build step, no backend, no AI chat involved: it simply searches the real web and ranks results by authority.

```
        ┌──────────────────────────────────────────────┐
        │  深搜 DeepSou · est. 1998 (revived 2026)      │
        │  ┌──────────────────────────┐  ┌────────┐    │
        │  │  what were dinosaurs…    │  │ 搜一下 │    │
        │  └──────────────────────────┘  └────────┘    │
        └──────────────────────────────────────────────┘
```

## Features

- **Retro 90s style** — Times New Roman links, Courier New mono, green/amber CRT night mode with scanlines, visitor counter, guestbook, "Best viewed at 1024×768, Netscape Navigator 4.0".
- **Real web search** — calls the DeepSeek Search API (`/v1/tools/search`) directly from the browser. No AI summarization, no chat completions: the results are actual web pages.
- **Authority ranking** — results are sorted by the API's `authority` field (0–4), displayed as a 0–10 score bar (authority × 2.5; falls back to `rerank_score` when authority is unknown). A result scoring ≥ 3/4 is labeled extremely authoritative.
- **"I'm feeling lucky"** — jumps straight to the top-ranked result.
- **Offline demo mode** — without an API key, it serves built-in local demo results so the page still works out of the box.
- **Zero dependencies** — one `index.html`, open it or serve statically and go.

## Quick Start

```bash
# any static server works
python3 -m http.server 8080
# open http://localhost:8080
```

Or just double-click `index.html`.

## Configuration

Click **API 设置** in the top navigation:

| Field | Default | Notes |
| --- | --- | --- |
| API Key | — | Your DeepSeek API key (`sk-...`) |
| Base URL | `https://api.deepseek.com` | API endpoint root |

The key is stored **only in your browser's `localStorage`** and sent only to DeepSeek itself; nothing is uploaded anywhere else. Use **测试连接** to verify the key before saving. With no key configured, DeepSou runs in offline demo mode (results tagged `本地`).

## How Results Are Ranked

DeepSeek Search API returns `authority` (0–4, -1 = unknown) per result. DeepSou maps it to a 0–10 display score:

```
score = authority >= 0 ? authority / 4 * 10 : rerank_score / 3 * 10
```

Results are sorted by score, descending. The green bar under each result shows the score.

## API Reference

- Endpoint: `POST {base}/v1/tools/search`
- Request: `{ "query": "...", "count": 12, "need_content": false }`
- Response: `results[]` with `title`, `url`, `snippet`, `site_name`, `date`, `authority`, `rerank_score`
- Docs: https://api-docs.deepseek.com/zh-cn/api/search.md

## Privacy

- No tracking, no analytics, no server-side logging.
- Your API key never leaves your browser except in direct requests to DeepSeek.

## License

MIT
