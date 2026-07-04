import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "关于",
  description: "关于 HaizhuAI：一份不止于博客的数字刊物。",
};

const milestones = [
  { label: "站点框架上线", desc: "纸与墨编辑风 UI · 博客系统 · AI 对话界面雏形", done: true },
  { label: "接入开源 AI 模型", desc: "Ollama / OpenAI 兼容接口，实现真实对话", done: false },
  { label: "文章 AI 助读", desc: "在文章页一键总结、答疑", done: false },
  { label: "更多功能", desc: "评论、搜索、订阅…… 由站长逐步揭晓", done: false },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-28">
      <Reveal>
        <p className="text-xs font-bold tracking-[0.3em] text-vermilion">
          ABOUT / 关于
        </p>
        <h1 className="font-serif-display mt-2 text-4xl font-black md:text-6xl">
          关于本站
        </h1>
        <div className="rule-strong mt-8" />
        <div className="prose-haizhu mt-6">
          <p>
            <strong>HaizhuAI</strong> 是一份「不止于博客」的数字刊物。
            这里既有资讯、教程和日常分享，也在逐步集成开源的 AI 对话工具 ——
            希望你在这里不仅能读到东西，还能<em>问</em>到东西。
          </p>
          <p>站点正在生长中，欢迎常来看看。</p>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <h2 className="font-serif-display mt-14 text-2xl font-black">路线图</h2>
        <ol className="mt-6 space-y-4 pb-10">
          {milestones.map((m, i) => (
            <li key={m.label} className="ink-card flex items-start gap-5 p-6">
              <span
                className={`font-serif-display text-2xl font-black ${
                  m.done ? "text-vermilion" : "text-rule"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="font-serif-display font-bold">
                  {m.label}
                  {m.done && (
                    <span className="ml-2 bg-vermilion px-2 py-0.5 text-xs text-white">
                      已完成
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-ink-faint">{m.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal delay={0.25}>
        <div className="ink-card mb-16 p-8 text-center">
          <p className="text-sm text-ink-soft">
            想先感受一下 AI 对话的雏形？
          </p>
          <Link
            href="/chat"
            className="btn-vermilion mt-5 inline-block px-7 py-3 text-sm font-bold"
          >
            去对话页 →
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
