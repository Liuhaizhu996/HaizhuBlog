import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import Reveal from "@/components/motion/Reveal";
import Typewriter from "@/components/motion/Typewriter";
import Marquee from "@/components/motion/Marquee";

const tickerItems = [
  "开源 AI 对话",
  "前端教程",
  "效率工具",
  "提示词技巧",
  "行业资讯",
  "生活日常",
  "Next.js",
  "自托管",
  "大模型",
];

const toolPreviews = [
  {
    no: "01",
    name: "AI 对话助手",
    desc: "站内即用的开源 AI 聊天，边读文章边提问，阅读与提问同时发生。",
    tag: "雏形可体验",
    accent: true,
  },
  {
    no: "02",
    name: "提示词实验室",
    desc: "收藏、管理、测试你的提示词模板，配合教程一起练习。",
    tag: "规划中",
    accent: false,
  },
  {
    no: "03",
    name: "模型广场",
    desc: "Llama、Qwen、DeepSeek 等开源模型自由切换、对比回答。",
    tag: "规划中",
    accent: false,
  },
  {
    no: "04",
    name: "文章 AI 助读",
    desc: "在文章页一键唤起 AI：总结全文、解释术语、生成练习题。",
    tag: "规划中",
    accent: false,
  },
];

const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export default function HomePage() {
  const posts = getAllPosts();
  const now = new Date();
  const dateline = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日 · ${weekdays[now.getDay()]}`;

  return (
    <div>
      {/* ============ 头版 Hero ============ */}
      <section className="mx-auto max-w-6xl px-5 pt-28">
        {/* 报头信息行 */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink pb-3 text-xs tracking-widest text-ink-faint">
          <span>VOL.01 · 数字刊物</span>
          <span>{dateline}</span>
          <span className="hidden md:inline">阅读 × 学习 × AI</span>
        </div>

        <div className="py-14 md:py-20">
          <h1 className="font-serif-display text-5xl font-black leading-[1.15] tracking-tight md:text-7xl">
            <span className="line-reveal">不止是博客，</span>
            <span className="line-reveal" style={{ animationDelay: "0.15s" }}>
              这里可以
              <Typewriter
                phrases={["与 AI 对话", "学到新东西", "看见新资讯", "记录小日常"]}
              />
            </span>
          </h1>

          <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <p className="max-w-xl text-base leading-loose text-ink-soft md:text-lg">
              HaizhuAI 是一份「纸与墨」风格的数字刊物 ——
              分享资讯、教程与日常，并集成开源 AI 对话工具，
              让阅读与提问同时发生。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/blog"
                className="btn-vermilion px-7 py-3 text-sm font-bold"
              >
                开始阅读
              </Link>
              <Link
                href="/chat"
                className="btn-outline-ink px-7 py-3 text-sm font-bold"
              >
                与 AI 对话 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 新闻滚动条 ============ */}
      <Marquee>
        {tickerItems.map((item) => (
          <span
            key={item}
            className="flex items-center gap-8 whitespace-nowrap text-sm tracking-wider text-ink-soft"
          >
            {item}
            <span className="text-vermilion">●</span>
          </span>
        ))}
      </Marquee>

      {/* ============ 编辑索引 · 最新文章 ============ */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] text-vermilion">
                INDEX / 目录
              </p>
              <h2 className="font-serif-display mt-2 text-3xl font-black md:text-4xl">
                最新文章
              </h2>
            </div>
            <Link
              href="/blog"
              className="link-ink text-sm text-ink-soft"
            >
              全部文章 →
            </Link>
          </div>
        </Reveal>

        <div className="rule-strong" />
        {posts.slice(0, 4).map((post, i) => (
          <Reveal key={post.slug} delay={i * 0.08}>
            <Link href={`/blog/${post.slug}`} className="group block">
              <article className="index-row grid grid-cols-[auto_1fr] items-baseline gap-5 border-b border-rule py-6 md:grid-cols-[auto_1fr_auto] md:gap-8">
                <span className="font-serif-display text-3xl font-black text-rule transition-colors group-hover:text-vermilion md:text-4xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-xs tracking-wider text-ink-faint">
                    <span className="font-bold text-vermilion">
                      {post.category}
                    </span>
                    <span>{post.date}</span>
                    <span>约 {post.readingMinutes} 分钟</span>
                  </div>
                  <h3 className="font-serif-display mt-2 text-xl font-bold leading-snug md:text-2xl">
                    {post.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-faint">
                    {post.excerpt}
                  </p>
                </div>
                <span className="hidden text-2xl text-ink-faint transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-vermilion md:block">
                  →
                </span>
              </article>
            </Link>
          </Reveal>
        ))}
      </section>

      {/* ============ AI 工具栏目 ============ */}
      <section className="border-y border-rule bg-paper-warm/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <p className="text-xs font-bold tracking-[0.3em] text-vermilion">
              AI TOOLKIT / 工具
            </p>
            <h2 className="font-serif-display mt-2 max-w-lg text-3xl font-black leading-snug md:text-4xl">
              AI 工具，长在刊物里
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-ink-soft">
              开源 AI 对话工具将逐步集成到这里 ——
              不用离开页面，就能向 AI 提问、练习提示词、比较模型。
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {toolPreviews.map((tool, i) => (
              <Reveal key={tool.name} delay={i * 0.08}>
                <div className="ink-card h-full p-7">
                  <div className="flex items-start justify-between">
                    <span
                      className={`font-serif-display text-3xl font-black ${
                        tool.accent
                          ? "text-vermilion"
                          : "text-rule"
                      }`}
                    >
                      {tool.no}
                    </span>
                    <span
                      className={`px-2.5 py-1 text-xs font-bold tracking-wider ${
                        tool.accent
                          ? "bg-vermilion text-white"
                          : "border border-rule text-ink-faint"
                      }`}
                    >
                      {tool.tag}
                    </span>
                  </div>
                  <h3 className="font-serif-display mt-5 text-xl font-bold">
                    {tool.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-faint">
                    {tool.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-10 text-center">
              <Link
                href="/tools"
                className="link-ink text-sm font-bold text-ink"
              >
                查看全部工具计划 →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ 卷尾 CTA ============ */}
      <section className="mx-auto max-w-6xl px-5 py-24 text-center">
        <Reveal>
          <p className="font-serif-display text-2xl italic text-ink-faint">
            "
          </p>
          <h2 className="font-serif-display mx-auto max-w-2xl text-3xl font-black leading-snug md:text-5xl">
            准备好一起
            <span className="text-vermilion">边聊边学</span>
            了吗？
          </h2>
          <p className="mx-auto mt-5 max-w-md leading-relaxed text-ink-soft">
            AI 对话功能正在接入中，先去读几篇文章，
            或到对话页抢先体验界面雏形。
          </p>
          <div className="mt-9 flex justify-center gap-4">
            <Link
              href="/chat"
              className="btn-vermilion px-8 py-3.5 text-sm font-bold"
            >
              进入对话
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
