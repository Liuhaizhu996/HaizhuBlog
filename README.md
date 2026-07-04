# HaizhuAI ⚡

一个「不止于博客」的站点：分享资讯、教程与日常，集成**真实可用**的开源 AI 对话工具（支持模型选择与文件上传），配套**管理后台**与无广告的精选站点导航。

## ✨ 特性

- **电影感 UI**：循环视频背景 Hero（rAF 持续监测 + 0.5s 淡入淡出手动循环）、Instrument Serif / Inter / Schibsted Grotesk 字体体系、黑白灰 + 荧光绿点缀
- **管理后台 `/admin`**（密码访问）：
  - 📝 文章发布：Markdown 编辑器，支持图片 / `<video>` / iframe 嵌入，发布即上线
  - 🤖 AI 模型：配置站点内置模型服务（访客免配置直接对话），密钥只存服务器
  - 🧭 站点导航：分组式链接管理（参考 Navlink），保存即生效
  - 💬 客服与联系方式：TG 机器人浮窗与关于页联系方式统一配置
- **真实 AI 对话**：
  - 模型选择下拉框 + 一键自动拉取模型列表
  - 双协议：任意 **OpenAI 兼容接口**（DeepSeek / 通义 / 硅基流动 / OneAPI / LM Studio / vLLM…）或本地 **Ollama**
  - **+ 号上传文件**（文本 / 代码，≤300KB×5），让 AI 总结、审查、改写
  - 流式输出、演示模式兜底；访客自配时密钥仅存浏览器 localStorage
- **TG 双向客服**：右下角 💬 浮窗即完整站内聊天（移植 [Customer-service-bot](https://github.com/xiaoyu132223/Customer-service-bot) 的机制，无需单独部署）——
  访客网页发消息 → 转发到站长 Telegram → 站长「引用回复」→ 自动回到访客网页；
  Bot Token / 管理员 ID 在后台配置，凭据仅存服务器；未配置时浮窗退化为 t.me 链接
- **博客系统**：Markdown 即文章（`content/posts/*.md`），分类筛选（资讯 / 教程 / 日常）
- **站点导航**：`/links` 精选开源项目与实用站点，无广告、无跟踪参数

## 🔐 管理后台

后台无站内入口，直接访问 `/admin`（页面已设 noindex）。密码通过环境变量设置：

```bash
ADMIN_PASSWORD=你的强密码   # 未设置时默认 haizhuai-admin，部署后务必修改
```

后台管理的数据保存在 `data/` 目录（settings.json / links.json / tgchat.json），文章写入 `content/posts/`。自托管部署请确保这两个目录可写并纳入备份。

## 💬 配置 TG 双向客服

1. 在 Telegram 找 **@BotFather** → `/newbot` 创建机器人，拿到 Bot Token；
2. 给你的新机器人发一条 `/start`（否则机器人无法主动私聊你）；
3. 找 **@userinfobot** 查到自己的数字 ID；
4. 后台 → 客服与联系方式 → 填入 Token 与数字 ID → 保存。

访客在右下角浮窗发的消息会实时转发到你的 Telegram（带 `🆔ID` 会话标记），
你对那条消息**引用回复**即可送回访客网页（3 秒内轮询送达）。
服务端通过 getUpdates 长轮询接收回复（`app/api/tgchat/` + `lib/tgchat.ts`），
若服务器无法直连 api.telegram.org，可用 `TG_API_BASE` 环境变量指向反代。

## 🧱 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 15（App Router）+ React 19 + TypeScript |
| 样式 | Tailwind CSS 4 |
| 动效 | Framer Motion + 自定义 rAF 视频淡入淡出 |
| 内容 | Markdown + gray-matter + marked |

## 🚀 本地开发

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 生产构建
```

## 🐳 Docker 部署

```bash
# 方式一：docker compose（推荐）
ADMIN_PASSWORD=你的强密码 docker compose up -d --build

# 方式二：手动构建运行
docker build -t haizhuai .
docker run -d --name haizhuai -p 3000:3000 \
  -e ADMIN_PASSWORD=你的强密码 \
  -v haizhuai-data:/app/data \
  -v haizhuai-posts:/app/content/posts \
  --restart unless-stopped haizhuai
```

- 镜像基于 `next build` 的 standalone 产物（多阶段构建，运行层无源码、无完整 node_modules）
- 两个数据卷务必挂载并纳入备份：`/app/data`（后台配置/密码哈希/客服会话）、`/app/content/posts`（文章）
- 可选环境变量：`AI_PROVIDER` / `AI_BASE_URL` / `AI_API_KEY`（站点内置模型服务，亦可后台配置）、`TG_API_BASE`（Telegram 反代）
- 管理后台无站内入口，直接访问 `http://你的域名/admin`（页面已设 noindex 防收录）

## 🤖 配置 AI 对话

两种方式任选：

**A. 访客自助（无需部署配置）**
打开「对话」页 → 右上角 ⚙ 设置 → 填服务类型 / 地址 / Key → 自动获取模型列表。配置只保存在访客自己的浏览器里。

**B. 站长统一配置（环境变量）**

```bash
AI_PROVIDER=openai          # 或 ollama
AI_BASE_URL=https://api.deepseek.com
AI_API_KEY=sk-xxx           # Ollama 可省略
```

对话后端在 `app/api/chat/route.ts`：统一把上游（OpenAI SSE / Ollama NDJSON）转成纯文本增量流；模型列表在 `app/api/models/route.ts`。

## 📁 目录结构

```
app/
  page.tsx            # 首页（视频 Hero / 提问框 / 文章 / 工具 / 导航预览）
  blog/               # 文章列表 + 详情
  tools/              # AI 工具广场
  chat/               # AI 对话（模型选择 + 文件上传）
  links/              # 站点导航（友情快捷链接）
  about/              # 关于 + 路线图
  api/chat/route.ts   # 对话接口（OpenAI 兼容 / Ollama / 演示兜底）
  api/models/route.ts # 模型列表拉取
components/
  VideoBackground.tsx # 视频背景（自定义 rAF 淡入淡出循环）
  HeroAsk.tsx         # 首页提问框
  chat/ChatShell.tsx  # 聊天界面
  icons.tsx           # SVG 图标集
lib/
  posts.ts            # 文章加载与解析
  links.ts            # 站点导航数据（在这里增删链接）
content/posts/        # Markdown 文章
```

## ✍️ 写一篇新文章

在 `content/posts/` 下新建 `my-post.md`：

```markdown
---
title: 文章标题
date: "2026-07-04"
category: 教程        # 资讯 / 教程 / 日常
excerpt: 一句话摘要，会显示在卡片上。
---

正文支持完整 Markdown 语法……
```

## 🔗 维护站点导航

编辑 `lib/links.ts`，按分组增删链接即可。约定：不放广告、不带跟踪参数。

## 🗺️ 路线图

- [x] 站点框架与现代浅色 UI（视频背景 Hero）
- [x] Markdown 博客系统
- [x] 真实 AI 对话（模型选择 / 文件上传 / 双协议）
- [x] 站点导航页
- [ ] 提示词实验室
- [ ] 文章 AI 助读（总结 / 答疑）
- [ ] 评论、搜索、订阅等功能
