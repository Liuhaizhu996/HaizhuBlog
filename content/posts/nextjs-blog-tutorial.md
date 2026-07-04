---
title: 教程：用 Next.js + Tailwind 从零搭建动效博客
date: "2026-07-03"
category: 教程
excerpt: 手把手带你搭建一个带极光背景、滚动动效的现代博客站点，本站就是这样做出来的。
---

本文记录本站的搭建过程，跟着做你也能拥有一个同款站点。

## 准备工作

确保本地安装了 Node.js 18+，然后初始化项目：

```bash
npx create-next-app@latest my-blog --typescript --tailwind --app
cd my-blog
npm install framer-motion gray-matter marked
```

## 核心思路

### 1. 内容即文件

把文章写成 Markdown 放在 `content/posts` 目录，用 `gray-matter` 解析头部元信息，`marked` 转换为 HTML。

### 2. 动效三板斧

- **极光背景**：几个大尺寸的模糊渐变圆，用 CSS 动画缓慢漂移；
- **滚动渐显**：`framer-motion` 的 `whileInView`，元素进入视口时上浮淡入；
- **微交互**：卡片 hover 抬升、按钮光晕、导航毛玻璃。

### 3. 性能与可访问性

记得尊重系统的"减弱动态效果"设置：

```css
@media (prefers-reduced-motion: reduce) {
  .fancy-animation { animation: none; }
}
```

## 小结

一个漂亮的博客不需要重型框架，Next.js + Tailwind + 少量动效就足够惊艳。完整源码就在本站仓库，欢迎参考。
