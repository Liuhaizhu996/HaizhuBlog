import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { getLinkGroups } from "@/lib/store";
import Reveal from "@/components/motion/Reveal";
import HeroScene from "@/components/HeroScene";
import PostCard from "@/components/PostCard";
import { ExternalLink } from "@/components/icons";
import { ArrowRight, Play } from "lucide-react";

// 文章与导航都可在后台随时变更，首页始终取最新数据
export const dynamic = "force-dynamic";

const toolPreviews = [
  {
    name: "AI 对话",
    desc: "选择模型、上传文件，真实可用的站内对话。",
    tag: "已上线",
    live: true,
    href: "/chat",
  },
  {
    name: "多模型接入",
    desc: "OpenAI 兼容接口与 Ollama 本地模型自由切换。",
    tag: "已上线",
    live: true,
    href: "/chat",
  },
  {
    name: "提示词实验室",
    desc: "收藏、管理、测试你的提示词模板。",
    tag: "规划中",
    live: false,
    href: "/tools",
  },
  {
    name: "文章 AI 助读",
    desc: "在文章页一键总结全文、解释术语。",
    tag: "规划中",
    live: false,
    href: "/tools",
  },
];

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);
  const quickLinks = getLinkGroups()
    .flatMap((g) => g.links)
    .slice(0, 8);

  return (
    <div>
      {/* ============ 电影感 Hero（动态图片背景：视差 + 水波 + 落樱） ============ */}
      <section className="relative min-h-screen w-full overflow-hidden">
        <HeroScene />

        <div
          className="relative z-10 flex flex-col items-center justify-center px-6 pb-40 text-center"
          style={{ paddingTop: "calc(8rem - 75px + 96px)" }}
        >
          {/* 主标题：Instrument Serif，斜体强调，leading-[1.1] */}
          <h1 className="font-display animate-fade-rise max-w-5xl text-6xl leading-[1.1] text-black sm:text-7xl md:text-8xl lg:text-[7.5rem]">
            Haizhu<em className="italic text-[#6F6F6F]">AI</em>
          </h1>

          {/* 副文案：轻字重两行 */}
          <p
            className="animate-fade-rise-delay mt-4 max-w-md text-sm font-light leading-relaxed text-[#3d3d3d] md:mt-5 md:text-base"
            style={{ textShadow: "0 1px 8px rgb(255 255 255 / 0.8)" }}
          >
            分享资讯、教程与日常的数字居所，
            <br className="hidden sm:block" />
            与开源 AI 一起边读边问，回归纯粹心流。
          </p>

          {/* CTA：主按钮箭头悬停右移，次按钮描边毛玻璃 */}
          <div className="animate-fade-rise-delay-2 mt-5 flex flex-col items-center gap-4 sm:flex-row md:mt-6">
            <Link
              href="/chat"
              className="group flex items-center gap-2 rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-black/85"
            >
              开始对话
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/blog"
              className="flex items-center gap-2 rounded-full border border-black/40 bg-white/40 px-7 py-3 text-sm text-black backdrop-blur-sm transition-colors hover:border-black/60 hover:bg-white/70"
            >
              <Play className="h-4 w-4" />
              浏览文章
            </Link>
          </div>
        </div>
      </section>

      {/* ============ 最新文章 ============ */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-[#6F6F6F]">Journal</p>
              <h2 className="font-display mt-1 text-4xl text-black md:text-5xl">
                最新文章
              </h2>
            </div>
            <Link href="/blog" className="link-under text-sm text-[#6F6F6F]">
              全部文章 →
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.1}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ AI 工具 ============ */}
      <section className="bg-cloud/70 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-sm font-medium text-[#6F6F6F]">Studio</p>
            <h2 className="font-display mt-1 text-4xl text-black md:text-5xl">
              AI 工具，长在站点里
            </h2>
            <p className="mt-4 max-w-lg text-[#6F6F6F]">
              对话工具真实可用 —— 支持 OpenAI 兼容接口与 Ollama
              本地模型，还能上传文件让 AI 帮你处理。
            </p>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {toolPreviews.map((tool, i) => (
              <Reveal key={tool.name} delay={i * 0.08}>
                <Link href={tool.href} className="block h-full">
                  <div className="card-soft flex h-full flex-col p-6">
                    <span
                      className={`self-start rounded-md px-2.5 py-1 text-xs font-semibold ${
                        tool.live
                          ? "bg-[rgba(90,225,76,0.2)] text-[#1d7a12]"
                          : "bg-cloud text-slate-mid"
                      }`}
                    >
                      {tool.tag}
                    </span>
                    <h3 className="font-grotesk mt-4 text-lg font-bold">
                      {tool.name}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-mid">
                      {tool.desc}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 站点导航 ============ */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-[#6F6F6F]">Links</p>
              <h2 className="font-display mt-1 text-4xl text-black md:text-5xl">
                站点导航
              </h2>
              <p className="mt-4 max-w-lg text-[#6F6F6F]">
                精选的开源项目与实用站点，无广告、无跟踪，内容由站长在后台维护。
              </p>
            </div>
            <Link href="/links" className="link-under text-sm text-[#6F6F6F]">
              全部链接 →
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((l, i) => (
            <Reveal key={l.url} delay={(i % 4) * 0.06}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="card-soft group flex items-start justify-between gap-3 p-5"
              >
                <div>
                  <p className="font-grotesk text-sm font-bold">{l.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-mid">
                    {l.desc}
                  </p>
                </div>
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-black/25 transition-colors group-hover:text-black" />
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="mx-auto max-w-6xl px-6 pb-4">
        <Reveal>
          <div className="rounded-3xl bg-black px-8 py-14 text-center text-white md:py-16">
            <h2 className="font-display text-4xl md:text-5xl">
              准备好一起<em className="italic text-lime">边聊边学</em>了吗？
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/70">
              到 AI 对话页选择模型、上传文件，或先去读几篇文章。
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link
                href="/chat"
                className="rounded-full bg-white px-10 py-3.5 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
              >
                开始对话
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
