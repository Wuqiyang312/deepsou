# DeepSou (深搜)

**English** | [简体中文](README.zh-CN.md)

A retro, early-internet-style search engine interface — 100% client-side. No backend, no API keys, no tracking.

You type a query, the site "searches" for a moment (1.4 seconds, of which about 1.3 are nostalgia), and hands you a page of plain blue links ranked by an **authority score** — exactly the way early search engines presented results.

> 深搜一下,你就知道。 — *DeepSou it, and you shall know.*

## Features

- **Retro Web 1.0 UI** — white background, Times New Roman blue links, monospace captions, a gray portal nav bar, a marquee announcement, a visitor counter, and a footer that still recommends 1024×768.
- **CRT Night Mode** — one click switches to a phosphor-green CRT theme with scanlines, chromatic logo aberration and a vignette. Your choice is remembered.
- **Authority-ranked results** — every result carries an authority score (0–10) shown with a vintage PageRank-style green bar, sorted descending.
- **"I'm Feeling Lucky" (手气不错)** — skips the list and jumps straight to the top result, the old Google way.
- **Old-school pagination** — 6 results per page with `上一页 1 2 3 下一页`.
- **Living retro furniture** — a Yahoo-style category directory, a hot-search chart, an actually-working guestbook, a snapshot viewer, and honest dialogs explaining why "set as homepage" no longer works.
- **Single self-contained `index.html`** — no build step, no frameworks, no dependencies. Double-click the file and you're in 1998.

## Quick Start

```bash
git clone https://github.com/Wuqiyang312/deepsou.git
open deepsou/index.html        # or just double-click the file

# or serve it statically
python3 -m http.server 8000    # then visit http://localhost:8000
```

## How a Search Works

1. You type a query (or click a category / hot-search entry).
2. A retro "searching the local index…" animation plays for about 1.4 s.
3. Eight locally generated results appear — encyclopedia, video, Q&A, open-source and blog archetypes mapped onto real, well-known sites — with authority scores descending from 9.6.
4. Results render as classic blocks: blue title link, green URL, snippet, and the green authority bar. **快照 (Snapshot)** opens a mock archive; **手气不错** jumps to the #1 result.

## Project Structure

```
deepsou/
├── index.html          # the entire site: markup + styles + logic
├── README.md           # this file (English)
└── README.zh-CN.md     # 简体中文说明
```

## Notes & Boundaries

- No backend, no API keys, no tracking: the guestbook, visitor counter and theme all live in your browser's `localStorage`.
- Results are generated locally for the retro experience; authority scores are illustrative, not a real ranking signal.
- `prefers-reduced-motion` is respected (marquee and scanlines switch off).

## Acknowledgements

- Interface inspiration: the year 1998 — AltaVista, early Google and Baidu, and Web 1.0 personal homepages everywhere.
