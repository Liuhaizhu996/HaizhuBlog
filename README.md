# HaizhuAI ⚡

一个「不止于博客」的站点：分享资讯、教程与日常，集成**真实可用**的开源 AI 对话工具（支持模型选择与文件上传），外加一页无广告的精选站点导航。

## ✨ 特性

- **现代浅色 UI**：循环视频背景 Hero（自定义 rAF 淡入淡出循环系统）、Schibsted Grotesk / Inter / Fustat / Noto Sans 字体体系、黑白 + 荧光绿点缀
- **真实 AI 对话**：
  - 模型选择下拉框 + 一键自动拉取模型列表
  - 双协议：任意 **OpenAI 兼容接口**（DeepSeek / 通义 / 硅基流动 / OneAPI / LM Studio / vLLM…）或本地 **Ollama**
  - **+ 号上传文件**（文本 / 代码，≤300KB×5），让 AI 总结、审查、改写
  - 流式输出、演示模式兜底；配置仅存浏览器 localStorage，不落服务端
- **博客系统**：Markdown 即文章（`content/posts/*.md`），分类筛选（资讯 / 教程 / 日常）
- **站点导航**：`/links` 精选开源项目与实用站点，无广告、无跟踪参数

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
