# DeepSou 深搜

**English** | [简体中文](README.zh-CN.md)

A nostalgic, early-internet-style search engine that connects to the **DeepSeek Web Search API** (`POST /v1/tools/search`) — pure static frontend, multi-file plain HTML/CSS/JS, no build step, no backend, no AI chat involved: it simply searches the real web and ranks results by authority. The homepage layout references the classic Baidu portal of 2009.

```
        ┌──────────────────────────────────────────────┐
        │            深  搜  (DeepSou)                  │
        │   网页 新闻 贴吧 知道 MP3 图片 视频 地图 百科    │
        │  ┌──────────────────────────┐ ┌────────┐     │
        │  │  what were dinosaurs…    │ │ 深搜一下│     │
        │  └──────────────────────────┘ └────────┘     │
        └──────────────────────────────────────────────┘
```

## Features

- **2009 Baidu-style homepage** — blue serif logotype, a row of blue channel tabs above the search box, wide input + solid blue button, "set as homepage" link row, and a 1024×768 footer.
- **Multi-page static site** — homepage, results, category directory, guestbook, about and settings are separate pages sharing one stylesheet and one common script.
- **Real web search** — calls the DeepSeek Search API (`/v1/tools/search`) directly from the browser. No AI summarization, no chat completions: the results are actual web pages.
- **Authority ranking** — results are sorted by the API's `authority` field (0–4), displayed as a 0–10 score bar (authority × 2.5; falls back to `rerank_score` when authority is unknown).
- **"I'm feeling lucky"** — jumps straight to the top-ranked result.
- **CRT night mode** — phosphor-green theme with scanlines, persisted across pages.
- **Offline demo mode** — without an API key, it serves built-in local demo results so the page still works out of the box.
- **Zero dependencies** — plain HTML/CSS/JS, serve statically and go.

## Quick Start

```bash
# any static server works
python3 -m http.server 8080
# open http://localhost:8080
```

## Pages

| Page | File | Purpose |
| --- | --- | --- |
| Homepage | `index.html` | Search box + channel tabs |
| Results | `results.html` | Reads `?q=…&tab=…` from the URL, searches and renders ranked results |
| Directory | `dir.html` | Yahoo-style category links into searches |
| Guestbook | `guestbook.html` | Local-only guestbook (localStorage) |
| About | `about.html` | About, ranking rule, privacy |
| Settings | `settings.html` | API key + base URL, with a live connection test |

## Configuration

Open **API 设置** (`settings.html`):

| Field | Default | Notes |
| --- | --- | --- |
| API Key | — | Your DeepSeek API key (`sk-...`) |
| Base URL | `https://api.deepseek.com` | API endpoint root |

The key is stored **only in your browser's `localStorage`** and sent only to DeepSeek itself; nothing is uploaded anywhere else. **测试连接** runs a real search to verify the key. With no key configured, DeepSou runs in offline demo mode (results tagged `本地`).

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
- Guestbook, visitor counter and theme preference live only in your own browser.

## License

MIT
