# 深搜 DeepSou

[English](README.md) | **简体中文**

一个怀旧互联网早期风格的搜索引擎,直连 **DeepSeek 网页搜索 API**(`POST /v1/tools/search`)——纯前端单文件 HTML,无构建、无后端、无 AI 对话:就是老老实实搜真实网页,并按权威值排序。

```
        ┌──────────────────────────────────────────────┐
        │  深搜 DeepSou · est. 1998 (复活于 2026)        │
        │  ┌──────────────────────────┐  ┌────────┐    │
        │  │  恐龙是怎么灭绝的…        │  │ 深搜一下│    │
        │  └──────────────────────────┘  └────────┘    │
        └──────────────────────────────────────────────┘
```

## 功能

- **90 年代复古风** — Times New Roman 链接、Courier New 等宽、绿/琥珀色 CRT 夜视模式(带扫描线)、访客计数器、留言本、"最佳分辨率 1024×768,兼容 Netscape Navigator 4.0"。
- **真实网页搜索** — 浏览器端直接调用 DeepSeek 网页搜索 API(`/v1/tools/search`)。没有 AI 总结、没有对话补全,搜出来的就是真实网页。
- **权威值排序** — 按 API 返回的 `authority` 字段(0–4)排序,页面显示为 0–10 分的权威值进度条(authority × 2.5;authority 未知时回退到 `rerank_score` 折算)。≥ 3/4 的结果即为"极权威"。
- **手气不错** — 直达权威值最高的第一条结果。
- **离线演示模式** — 未配置 API Key 时使用内置本地演示数据,页面开箱即用。
- **零依赖** — 只有一个 `index.html`,双击或静态托管即可运行。

## 快速开始

```bash
# 任意静态服务器均可
python3 -m http.server 8080
# 打开 http://localhost:8080
```

或直接双击 `index.html`。

## 配置

点击顶部导航的 **API 设置**:

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| API Key | — | 你的 DeepSeek API Key(`sk-` 开头) |
| 接口地址 | `https://api.deepseek.com` | API 根地址 |

Key **仅保存在浏览器 `localStorage` 中**,只发给 DeepSeek 官方接口,不会上传到任何其他服务器。保存前可用 **测试连接** 验证 Key 是否可用。未配置 Key 时,深搜进入离线演示模式(结果带 `本地` 标记)。

## 排序规则

DeepSeek 搜索 API 为每条结果返回 `authority`(0–4,-1 表示未知),深搜将其折算为 0–10 分显示:

```
得分 = authority >= 0 ? authority / 4 * 10 : rerank_score / 3 * 10
```

结果按得分从高到低排序,每条结果下方的绿色进度条即为权威值。

## 接口参考

- 端点:`POST {base}/v1/tools/search`
- 请求:`{ "query": "...", "count": 12, "need_content": false }`
- 响应:`results[]`,含 `title`、`url`、`snippet`、`site_name`、`date`、`authority`、`rerank_score`
- 文档:https://api-docs.deepseek.com/zh-cn/api/search.md

## 隐私

- 无追踪、无统计、无服务端日志。
- API Key 除直连 DeepSeek 外不会离开你的浏览器。

## 许可证

MIT
