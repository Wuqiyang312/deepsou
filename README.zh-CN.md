# 深搜 DeepSou

[English](README.md) | **简体中文**

一个怀旧互联网早期风格的搜索引擎,直连 **DeepSeek 网页搜索 API**(`POST /v1/tools/search`)——纯静态多文件前端(原生 HTML/CSS/JS),无构建、无后端、无 AI 对话:就是老老实实搜真实网页,并按权威值排序。首页布局参考 2009 年前后的古典百度。

```
        ┌──────────────────────────────────────────────┐
        │            深  搜  (DeepSou)                  │
        │   网页 新闻 贴吧 知道 MP3 图片 视频 地图 百科    │
        │  ┌──────────────────────────┐ ┌────────┐     │
        │  │  恐龙是怎么灭绝的…        │ │ 深搜一下│     │
        │  └──────────────────────────┘ └────────┘     │
        └──────────────────────────────────────────────┘
```

## 功能

- **2009 百度式首页** — 蓝色衬线大 logo、搜索框上方一排蓝色栏目 tab、宽输入框 + 蓝色实心按钮、框下「设为首页」链接行、1024×768 页脚。
- **多页面静态站点** — 首页、结果页、分类目录、留言本、关于、设置各自独立成页,共用一份样式和一份公共脚本。
- **真实网页搜索** — 浏览器端直接调用 DeepSeek 网页搜索 API(`/v1/tools/search`)。没有 AI 总结、没有对话补全,搜出来的就是真实网页。
- **权威值排序** — 按 API 返回的 `authority` 字段(0–4)排序,页面显示为 0–10 分(×2.5;authority 未知时回退 `rerank_score` 折算)。
- **手气不错** — 直达权威值最高的第一条结果。
- **CRT 夜视模式** — 磷光绿扫描线主题,跨页面保持。
- **离线演示模式** — 未配置 API Key 时使用内置本地演示数据,开箱即用。
- **零依赖** — 原生 HTML/CSS/JS,静态托管即可运行。

## 快速开始

```bash
# 任意静态服务器均可
python3 -m http.server 8080
# 打开 http://localhost:8080
```

## 页面一览

| 页面 | 文件 | 说明 |
| --- | --- | --- |
| 首页 | `index.html` | 搜索框 + 栏目 tab |
| 结果页 | `results.html` | 从 URL 读 `?q=…&tab=…`,检索并渲染按权威值排序的结果 |
| 分类目录 | `dir.html` | 雅虎式分类,点击词条直达搜索 |
| 留言本 | `guestbook.html` | 仅本机可见的留言(localStorage) |
| 关于 | `about.html` | 关于本站、排序规则、隐私说明 |
| 设置 | `settings.html` | API Key + 接口地址,带真实测试连接 |

## 配置

打开 **API 设置**(`settings.html`):

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| API Key | — | 你的 DeepSeek API Key(`sk-` 开头) |
| 接口地址 | `https://api.deepseek.com` | API 根地址 |

Key **仅保存在浏览器 `localStorage` 中**,只发给 DeepSeek 官方接口。**测试连接** 会用真实搜索验证 Key 是否可用。未配置 Key 时进入离线演示模式(结果带「本地」标记)。

## 排序规则

DeepSeek 搜索 API 为每条结果返回 `authority`(0–4,-1 表示未知),深搜折算为 0–10 分:

```
得分 = authority >= 0 ? authority / 4 * 10 : rerank_score / 3 * 10
```

结果按得分降序排列,每条结果下方的绿色进度条即为权威值。

## 接口参考

- 端点:`POST {base}/v1/tools/search`
- 请求:`{ "query": "...", "count": 12, "need_content": false }`
- 响应:`results[]`,含 `title`、`url`、`snippet`、`site_name`、`date`、`authority`、`rerank_score`
- 文档:https://api-docs.deepseek.com/zh-cn/api/search.md

## 隐私

- 无追踪、无统计、无服务端日志。
- API Key 除直连 DeepSeek 外不会离开你的浏览器。
- 留言本、访客计数、夜视模式偏好只存在你自己的浏览器里。

## 许可证

MIT
