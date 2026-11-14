# 深度搜索 DeepSou

[English](README.md) | **简体中文**

一个怀旧互联网早期风格的搜索引擎,后端接入 **DeepSeek 网页搜索 API**(`POST /v1/tools/search`)。浏览器不接触 API Key:由零依赖的 Node 后端在服务器端持有密钥并转发所有请求,没有 AI 对话,就是老老实实搜真实网页并按权威值排序。

```
        ┌──────────────────────────────────────────────┐
        │  深度搜索 DeepSou · est. 1998 (复活于 2026)   │
        │  ┌──────────────────────────┐  ┌────────┐    │
        │  │  恐龙是怎么灭绝的…        │  │深度搜索一下│  │
        │  └──────────────────────────┘  └────────┘    │
        └──────────────────────────────────────────────┘
```

## 功能

- **2009 百度式首页** — 蓝色衬线大标题、搜索框上方栏目 tab、宽搜索框加方正蓝按钮、页脚版权行;前端为多文件静态页面,无构建、无框架。
- **后端统一转发** — 搜索与测试请求全部走本站后端(`POST /api/search`、`POST /api/test`);DeepSeek Key 保存在服务端 `config.json`(已 gitignore)或环境变量 `DEEPSO_KEY` / `DEEPSO_BASE`,永不下发浏览器。
- **真实网页搜索** — 后端转发 DeepSeek 网页搜索 API(`/v1/tools/search`),没有 AI 总结、没有对话补全,搜出来的就是真实网页。
- **权威值排序** — 按 API 返回的 `authority` 字段(0–4)折算为 0–10 分进度条(未知时回退 `rerank_score`),得分从高到低排序。
- **手气不错** — 直达权威值最高的第一条结果。
- **离线演示模式** — 服务器未配置 Key 时使用内置本地演示数据,开箱即用。
- **小玩意** — 雅虎式分类目录、留言本、CRT 夜视模式(带扫描线)。

## 快速开始

```bash
node server.js
# 打开 http://localhost:3000
```

或用 Docker:

```bash
docker build -t deepsou .
docker run -p 3000:3000 -e DEEPSO_KEY=sk-... deepsou
```

然后点页脚链接的 **API 设置**,粘贴 DeepSeek Key,保存并测试连接。

## 配置

服务端三选一:

| 方式 | 说明 |
| --- | --- |
| 网页 | 页脚 **API 设置** 保存(写入 `config.json`) |
| 环境变量 | `DEEPSO_KEY`、`DEEPSO_BASE`(优先级高于 `config.json`) |
| 文件 | 在 `server.js` 旁建 `config.json`:`{ "key": "sk-...", "base": "https://api.deepseek.com" }` |

`config.json` 已加入 **.gitignore**,密钥不会进仓库。浏览器只能读到 `GET /api/config` 返回的 `{ configured, base, keyMasked }`,永远拿不到完整 Key。

## 后端接口

| 端点 | 方法 | 说明 |
| --- | --- | --- |
| `/api/search` | POST | 请求体 `{ query, count }`,转发 DeepSeek 搜索,归一化并按权威值排序后返回 |
| `/api/test` | POST | 连通性测试(用「DeepSeek」做一次真实搜索) |
| `/api/config` | GET | 返回 `{ configured, base, keyMasked }`,不暴露密钥 |
| `/api/config` | POST | 保存 `{ key, base }` 到 `config.json` |
| `/api/config` | DELETE | 清除已存 Key |

错误码:`401` = 未配置 Key;`502` = 上游接口异常。

## 排序规则

DeepSeek 搜索 API 为每条结果返回 `authority`(0–4,-1 表示未知),深度搜索将其折算为 0–10 分显示:

```
得分 = authority >= 0 ? authority / 4 * 10 : rerank_score / 3 * 10
```

结果按得分从高到低排序,每条结果下方的绿色进度条即为权威值。

## 上游接口参考

- 端点:`POST {base}/v1/tools/search`
- 请求:`{ "query": "...", "count": 12, "need_content": false }`
- 响应:`results[]`,含 `title`、`url`、`snippet`、`site_name`、`date`、`authority`、`rerank_score`
- 文档:https://api-docs.deepseek.com/zh-cn/api/search.md

## 目录结构

```
server.js        Node 后端(静态托管 + API 转发,零依赖)
index.html       首页(2009 百度式布局)
results.html     搜索结果页
dir.html         分类目录页
guestbook.html   留言本
settings.html    API 设置页
about.html       关于本站 / 隐私 / 技术说明
css/  js/        全站样式与按页面拆分的脚本
Dockerfile       一体化镜像
config.json      服务端密钥文件(已 gitignore)
```

## 隐私

- 无追踪、无统计脚本、无请求日志。
- API Key 只留在服务器,浏览器只与本站后端通信。

## 许可证

MIT
