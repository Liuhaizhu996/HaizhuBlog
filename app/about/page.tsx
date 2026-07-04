import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "关于",
  description: "关于海竹小站：一个不止于博客的个人站点。",
};

const milestones = [
  { label: "站点框架上线", desc: "极光风格 UI · 博客系统 · AI 对话界面雏形", done: true },
  { label: "接入开源 AI 模型", desc: "Ollama / OpenAI 兼容接口，实现真实对话", done: false },
  { label: "文章 AI 助读", desc: "在文章页一键总结、答疑", done: false },
  { label: "更多功能", desc: "评论、搜索、订阅…… 由站长逐步揭晓", done: false },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-32">
      <Reveal>
        <p className="text-sm font-medium tracking-widest text-[#ff5ca8]">ABOUT</p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">关于本站</h1>
        <div className="prose-haizhu mt-8">
          <p>
            <strong>海竹小站</strong>是一个「不止于博客」的个人站点。
            这里既有资讯、教程和日常分享，也在逐步集成开源的 AI 对话工具 ——
            希望你在这里不仅能读到东西，还能<em>问</em>到东西。
          </p>
          <p>
            站点正在生长中，欢迎常来看看。
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <h2 className="mt-14 text-2xl font-bold">路线图</h2>
        <ol className="mt-6 space-y-4 pb-10">
          {milestones.map((m) => (
            <li key={m.label} className="glass flex items-start gap-4 rounded-2xl p-5">
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                  m.done
                    ? "bg-gradient-to-br from-[#7c5cff] to-[#38d4ff] text-white"
                    : "border border-white/15 text-white/40"
                }`}
              >
                {m.done ? "✓" : "•"}
              </span>
              <div>
                <p className="font-semibold">{m.label}</p>
                <p className="mt-1 text-sm text-[--color-mist]">{m.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal delay={0.25}>
        <div className="glass mb-16 rounded-2xl p-6 text-center">
          <p className="text-sm text-[--color-mist]">想先感受一下 AI 对话的雏形？</p>
          <Link
            href="/chat"
            className="btn-aurora mt-4 inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white"
          >
            去对话页 →
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
