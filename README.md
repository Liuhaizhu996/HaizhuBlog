# HaizhuAI ✒️

一份「不止于博客」的数字刊物：分享资讯、教程与日常，并逐步集成开源 AI 对话工具，让阅读与提问同时发生。

## ✨ 特性

- **纸与墨编辑风 UI**（Editorial Magazine）：暖纸底色 + 墨黑衬线大标题 + 朱砂点缀 + 报纸细线网格 + 纸张颗粒质感；动效包括标题逐行揭示、新闻 ticker、下划线书写、卡片墨影抬升、滚动渐显
- **博客系统**：Markdown 即文章（`content/posts/*.md`），支持分类筛选（资讯 / 教程 / 日常）
- **AI 对话雏形**：完整的聊天界面 + 可插拔后端接口，接入真实模型只需改一个文件
- **响应式设计**：桌面 / 移动端全适配，尊重系统"减弱动态效果"偏好

## 🧱 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 15（App Router）+ React 19 + TypeScript |
| 样式 | Tailwind CSS 4 |
| 动效 | Framer Motion |
| 内容 | Markdown + gray-matter + marked |

## 🚀 本地开发

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 生产构建
```

## 📁 目录结构

```
app/
  page.tsx            # 首页（头版 Hero / 新闻 ticker / 编辑索引 / AI 工具栏目）
  blog/               # 文章列表 + 详情
  tools/              # AI 工具广场
  chat/               # AI 对话页
  about/              # 关于 + 路线图
  api/chat/route.ts   # 对话后端接口（当前为演示回复，可替换为真实模型）
components/
  motion/             # 动效原语：Reveal / Marquee(ticker) / Typewriter
  chat/ChatShell.tsx  # 聊天界面
content/posts/        # Markdown 文章
lib/posts.ts          # 文章加载与解析
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

保存即生效，无需其他配置。

## 🤖 接入真实 AI 模型

前端聊天界面已就绪，只需修改 `app/api/chat/route.ts`，将演示回复替换为对任意模型服务的调用：

- **Ollama**（本地）：`POST http://localhost:11434/api/chat`
- **OpenAI 兼容接口**：任何提供 `/v1/chat/completions` 的开源推理服务
- **云端 API**：配置环境变量密钥后转发

## 🗺️ 路线图

- [x] 站点框架与动效 UI
- [x] Markdown 博客系统
- [x] AI 对话界面雏形 + API 桩
- [ ] 接入开源大模型（Ollama / OpenAI 兼容）
- [ ] 文章 AI 助读（总结 / 答疑）
- [ ] 评论、搜索、订阅等功能
