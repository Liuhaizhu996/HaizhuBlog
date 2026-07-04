import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import { getSettings } from "@/lib/store";

export const metadata: Metadata = {
  title: "关于",
  description: "关于 HaizhuAI：一个不止于博客的站点，以及站长的联系方式。",
};

// 联系方式可在后台修改，保持动态渲染
export const dynamic = "force-dynamic";

const milestones = [
  {
    label: "站点框架上线",
    desc: "电影感视频 Hero · 博客系统 · 现代浅色 UI",
    done: true,
  },
  {
    label: "真实 AI 对话",
    desc: "模型选择、文件上传、OpenAI 兼容 / Ollama 双协议接入",
    done: true,
  },
  {
    label: "管理后台",
    desc: "文章发布、AI 模型、站点导航、客服配置全部后台化",
    done: true,
  },
  {
    label: "文章 AI 助读",
    desc: "在文章页一键总结、答疑",
    done: false,
  },
  {
    label: "更多功能",
    desc: "提示词实验室、评论、搜索、订阅…… 由站长逐步揭晓",
    done: false,
  },
];

export default function AboutPage() {
  const { contacts } = getSettings();

  const contactCards = [
    { label: "WeChat", value: contacts.wechat, href: null, icon: "💚" },
    { label: "QQ", value: contacts.qq, href: null, icon: "🐧" },
    {
      label: "Blog",
      value: contacts.blog,
      href: `https://${contacts.blog.replace(/^https?:\/\//, "")}`,
      icon: "📝",
    },
    { label: "Telegram", value: contacts.telegram, href: null, icon: "✈️" },
    {
      label: "WhatsApp",
      value: contacts.whatsapp,
      href: `https://wa.me/${contacts.whatsapp.replace(/[^\d]/g, "")}`,
      icon: "📱",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 pt-28">
      <Reveal>
        <p className="text-sm font-medium text-[#6F6F6F]">About</p>
        <h1 className="font-display mt-1 text-5xl text-black md:text-6xl">
          关于本站
        </h1>
        <div className="prose-haizhu mt-6">
          <p>
            <strong>HaizhuAI</strong> 是一个「不止于博客」的站点。
            这里既有资讯、教程和日常分享，也集成了真实可用的开源 AI 对话工具 ——
            希望你在这里不仅能读到东西，还能<em>问</em>到东西。
          </p>
          <p>站点正在生长中，欢迎常来看看。</p>
        </div>
      </Reveal>

      {/* 联系方式 */}
      <Reveal delay={0.1}>
        <h2 className="font-display mt-14 text-3xl">联系站长</h2>
        <p className="mt-2 text-sm text-[#6F6F6F]">
          合作、反馈、闲聊都欢迎。也可以点击右下角的 💬 浮窗直接对话。
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {contactCards.map((c) => {
            const body = (
              <div className="card-soft flex items-center gap-4 p-5">
                <span className="text-2xl">{c.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#6F6F6F]">
                    {c.label}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold">
                    {c.value}
                  </p>
                </div>
              </div>
            );
            return c.href ? (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {body}
              </a>
            ) : (
              <div key={c.label}>{body}</div>
            );
          })}
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <h2 className="font-display mt-14 text-3xl">路线图</h2>
        <ol className="mt-6 space-y-4 pb-10">
          {milestones.map((m, i) => (
            <li key={m.label} className="card-soft flex items-start gap-4 p-5">
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  m.done
                    ? "bg-[rgba(90,225,76,0.89)] text-[#052e05]"
                    : "bg-cloud text-black/40"
                }`}
              >
                {m.done ? "✓" : i + 1}
              </span>
              <div>
                <p className="font-grotesk font-bold">{m.label}</p>
                <p className="mt-1 text-sm text-slate-mid">{m.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal delay={0.25}>
        <div className="card-soft mb-16 p-8 text-center">
          <p className="text-sm text-slate-mid">
            想试试真实的 AI 对话？带上你的问题来。
          </p>
          <Link
            href="/chat"
            className="mt-4 inline-block rounded-full bg-black px-8 py-3 text-sm text-white transition-transform hover:scale-[1.03]"
          >
            去对话页 →
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
