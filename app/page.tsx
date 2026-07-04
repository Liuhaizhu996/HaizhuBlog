import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { linkGroups } from "@/lib/links";
import Reveal from "@/components/motion/Reveal";
import VideoBackground from "@/components/VideoBackground";
import HeroAsk from "@/components/HeroAsk";
import PostCard from "@/components/PostCard";
import { Star, ExternalLink } from "@/components/icons";

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

const quickLinks = linkGroups.flatMap((g) => g.links).slice(0, 8);

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <div>
      {/* ============ Hero（视频背景） ============ */}
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 lg:px-[120px]">
        <VideoBackground />

        {/* 提示词规格：内容上移 50px；徽章→标题 34px、标题→副标题 34px、副标题→提问框 44px */}
        <div className="relative -mt-[50px] flex flex-col items-center pt-24 text-center">
          {/* 徽章组件 */}
          <div className="flex items-center rounded-full bg-white/90 py-1 pl-1 pr-4 text-sm shadow-md shadow-black/5">
            <span className="mr-2.5 flex items-center gap-1 rounded-full bg-badge-dark px-2.5 py-1 text-xs font-medium text-white">
              <Star className="h-3 w-3 text-lime" />
              New
            </span>
            <span className="font-body text-sm text-black/80">
              站内 AI 对话已支持选模型与传文件
            </span>
          </div>

          {/* 主标题：Fustat Bold 80px */}
          <h1 className="font-display mt-[34px] max-w-4xl text-5xl font-bold leading-none tracking-[-2px] md:text-[80px] md:tracking-[-4.8px]">
            边读边问
            <br className="md:hidden" />
            ，学得更快
          </h1>

          {/* 副标题：Fustat Medium 20px #505050 */}
          <p className="font-display mt-[34px] max-w-[736px] text-lg font-medium tracking-[-0.4px] text-slate-mid md:text-xl">
            上传你的资料，向开源 AI 提问，即刻获得答案。
            读文章、学教程、聊模型，一个站点全部搞定。
          </p>

          {/* 提问框 */}
          <div className="mt-[44px] w-full">
            <HeroAsk />
          </div>
        </div>
      </section>

      {/* ============ 最新文章 ============ */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="font-grotesk text-sm font-semibold text-[#2aa11d]">
                BLOG
              </p>
              <h2 className="font-grotesk mt-1 text-3xl font-bold tracking-[-1px] md:text-4xl">
                最新文章
              </h2>
            </div>
            <Link href="/blog" className="link-under text-sm text-slate-mid">
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
            <p className="font-grotesk text-sm font-semibold text-[#2aa11d]">
              AI TOOLKIT
            </p>
            <h2 className="font-grotesk mt-1 text-3xl font-bold tracking-[-1px] md:text-4xl">
              AI 工具，长在站点里
            </h2>
            <p className="mt-3 max-w-lg text-slate-mid">
              对话工具已真实可用 —— 支持 OpenAI 兼容接口与 Ollama
              本地模型，还能上传文件让 AI 帮你处理。
            </p>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
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

      {/* ============ 站点导航（友情快捷链接） ============ */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="font-grotesk text-sm font-semibold text-[#2aa11d]">
                LINKS
              </p>
              <h2 className="font-grotesk mt-1 text-3xl font-bold tracking-[-1px] md:text-4xl">
                站点导航
              </h2>
              <p className="mt-3 max-w-lg text-slate-mid">
                精选的开源项目与实用站点，无广告、无跟踪。
              </p>
            </div>
            <Link href="/links" className="link-under text-sm text-slate-mid">
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
          <div className="rounded-3xl bg-badge-dark px-8 py-14 text-center text-white md:py-16">
            <h2 className="font-grotesk text-3xl font-bold tracking-[-1px] md:text-4xl">
              准备好一起<span className="text-lime">边聊边学</span>了吗？
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/70">
              连接你自己的模型服务（OpenAI 兼容 / Ollama），
              或先用演示模式感受交互。
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link
                href="/chat"
                className="btn-lime rounded-lg px-7 py-3 text-sm font-bold"
              >
                开始对话
              </Link>
              <Link
                href="/blog"
                className="rounded-lg border border-white/25 px-7 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                先去读文章
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
