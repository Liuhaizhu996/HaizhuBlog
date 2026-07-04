import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import Reveal from "@/components/motion/Reveal";
import Typewriter from "@/components/motion/Typewriter";
import Marquee from "@/components/motion/Marquee";
import TiltCard from "@/components/motion/TiltCard";
import PostCard from "@/components/PostCard";

const marqueeItems = [
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
    name: "AI 对话助手",
    desc: "站内即用的开源 AI 聊天，边读文章边提问。",
    tag: "即将接入",
    span: "md:col-span-2",
    icon: "💬",
  },
  {
    name: "提示词实验室",
    desc: "练习并收藏你的提示词。",
    tag: "规划中",
    span: "",
    icon: "🧪",
  },
  {
    name: "模型广场",
    desc: "多个开源模型自由切换。",
    tag: "规划中",
    span: "",
    icon: "🛰️",
  },
  {
    name: "学习路径",
    desc: "跟着教程 + AI 答疑，一步步进阶。",
    tag: "规划中",
    span: "md:col-span-2",
    icon: "🗺️",
  },
];

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* ============ Hero ============ */}
      <section className="flex min-h-[92vh] flex-col items-center justify-center pt-16 text-center">
        <Reveal>
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-[--color-mist]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#38d4ff]" />
            海竹小站 · 正在生长中
          </span>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="mt-8 max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
            不止是博客，
            <br />
            这里可以<Typewriter phrases={["与 AI 对话", "学到新东西", "看见新资讯", "记录小日常"]} />
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[--color-mist] md:text-lg">
            分享资讯、教程与日常，并集成开源 AI 对话工具 ——
            在这里，阅读和提问可以同时发生。
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/blog"
              className="btn-aurora rounded-full px-7 py-3 text-sm font-semibold text-white"
            >
              开始阅读
            </Link>
            <Link
              href="/chat"
              className="glass glass-hover rounded-full px-7 py-3 text-sm font-semibold"
            >
              体验 AI 对话 →
            </Link>
          </div>
        </Reveal>

        {/* 向下滚动提示 */}
        <div className="mt-20 flex flex-col items-center gap-2 text-white/25">
          <span className="text-xs tracking-widest">向下探索</span>
          <span className="block h-8 w-px animate-pulse bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* ============ 跑马灯 ============ */}
      <section className="py-6">
        <Marquee>
          {marqueeItems.map((item) => (
            <span
              key={item}
              className="glass whitespace-nowrap rounded-full px-5 py-2 text-sm text-[--color-mist]"
            >
              {item}
            </span>
          ))}
        </Marquee>
      </section>

      {/* ============ 最新文章 ============ */}
      <section className="py-20">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium tracking-widest text-[#38d4ff]">
                BLOG
              </p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">最新文章</h2>
            </div>
            <Link
              href="/blog"
              className="text-sm text-[--color-mist] transition-colors hover:text-white"
            >
              全部文章 →
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.12}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ AI 工具 Bento ============ */}
      <section className="py-20">
        <Reveal>
          <div className="mb-10">
            <p className="text-sm font-medium tracking-widest text-[#7c5cff]">
              AI TOOLKIT
            </p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              AI 工具，长在站点里
            </h2>
            <p className="mt-3 max-w-lg text-[--color-mist]">
              开源 AI 对话工具将逐步集成到这里 ——
              不用离开页面，就能向 AI 提问、练习提示词、比较模型。
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {toolPreviews.map((tool, i) => (
            <Reveal key={tool.name} delay={i * 0.1} className={tool.span}>
              <TiltCard className="h-full">
                <div className="glass glass-hover flex h-full flex-col rounded-3xl p-7">
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{tool.icon}</span>
                    <span className="rounded-full border border-[#7c5cff]/30 bg-[#7c5cff]/10 px-3 py-1 text-xs text-[#b9a8ff]">
                      {tool.tag}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{tool.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[--color-mist]">
                    {tool.desc}
                  </p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-20">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-3xl p-10 text-center md:p-16">
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-[#7c5cff]/15 via-transparent to-[#38d4ff]/15"
            />
            <h2 className="relative text-2xl font-bold md:text-4xl">
              准备好一起<span className="text-aurora">边聊边学</span>了吗？
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-[--color-mist]">
              AI 对话功能正在接入中，先去看看文章，或者到对话页抢先体验界面雏形。
            </p>
            <div className="relative mt-8 flex justify-center gap-4">
              <Link
                href="/chat"
                className="btn-aurora rounded-full px-7 py-3 text-sm font-semibold text-white"
              >
                进入对话
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
