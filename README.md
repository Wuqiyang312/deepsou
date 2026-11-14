# DeepSou (深搜)

**English** | [简体中文](README.zh-CN.md)

A retro, early-internet-style search engine powered by DeepSeek.

The AI goes back behind the curtain and plays a 1998 human search assistant: you type a question, it "reads the entire Internet" in about two seconds, and hands you a page of plain blue links — sorted by an **authority score**, exactly the way early search engines ranked pages.

> 深搜一下,你就知道。 — *DeepSou it, and you shall know.*

## Features

- **Retro Web 1.0 UI** — white background, Times New Roman blue links, monospace captions, a gray portal nav bar, a marquee announcement, a visitor counter, and a footer that still recommends 1024×768.
- **CRT Night Mode** — one click switches to a phosphor-green CRT theme with scanlines, chromatic logo aberration and a vignette. Your choice is remembered.
- **DeepSeek-powered retrieval** — uses `deepseek-chat` (fast) or `deepseek-reasoner` (deep). Your API key is stored only in your browser's `localStorage` and never sent anywhere except DeepSeek itself.
- **Authority-ranked results** — every result carries an authority score (0–10) shown with a vintage PageRank-style green bar. Results are sorted by authority, descending — both by the model and again client-side.
- **"I'm Feeling Lucky" (手气不错)** — skips the list and jumps straight to the highest-authority result, the old Google way.
- **Old-school pagination** — 6 results per page with `上一页 1 2 3 下一页`. Page turns are pure client-side, so no extra API calls.
- **Living retro furniture** — a category directory (Yahoo-style), a hot-search chart, an actually-working guestbook, a snapshot viewer, and a settings dialog with a connection test.
- **Demo Mode** — without an API key the whole flow runs on built-in sample data, so you can feel the site immediately. Sorting logic is identical to live mode.
- **Single self-contained `index.html`** — no build step, no frameworks, no dependencies. Open it and you're in 1998.

## Quick Start

```bash
# Just open it
git clone https://github.com/Wuqiyang312/deepsou.git
open deepsou/index.html        # or double-click the file

# or serve it statically
python3 -m http.server 8000    # then visit http://localhost:8000
```

## Connecting DeepSeek

1. Click **API 设置 (API Settings)** in the top-right nav bar.
2. Paste your DeepSeek API key (`sk-...`), pick a model, keep the default base URL `https://api.deepseek.com` unless you use a relay.
3. Hit **测试连接 (Test Connection)** to verify, then **保存 (Save)**.

The key lives in your browser's `localStorage` only. Without a key, the site runs in Demo Mode with clearly tagged sample results.

## How a Search Works

1. You type a query (or click a category / hot-search entry).
2. A retro "retrieving..." animation plays while DeepSeek is asked — in Chinese — to act as a 1998 human search assistant and return strict JSON: an editor's note plus 6–10 results with `title`, `url`, `summary` and an `authority` score.
3. The client sorts by authority, paginates, and renders classic result blocks: blue title link, green URL, snippet, and the green authority bar.
4. **快照 (Snapshot)** opens a mock archive of the page; **手气不错** jumps to the #1 result.

## Project Structure

```
deepsou/
├── index.html          # the entire site: markup + styles + logic
├── README.md           # this file (English)
└── README.zh-CN.md     # 简体中文说明
```

## Notes & Boundaries

- No tracking, no backend: the guestbook, visitor counter, theme and API key all live in `localStorage` on your own browser.
- The "设为首页 / 加入收藏" menu items are faithful period furniture — they open honest dialogs explaining why browsers no longer allow sites to set themselves as homepages.
- `prefers-reduced-motion` is respected (marquee and scanlines switch off).

## Acknowledgements

- Search intelligence: [DeepSeek](https://www.deepseek.com)
- Interface inspiration: the year 1998 — AltaVista, early Google and Baidu, Web 1.0 personal homepages everywhere
