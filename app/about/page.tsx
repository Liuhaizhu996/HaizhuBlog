import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "关于",
  description: "关于 HaizhuAI：一个不止于博客的站点。",
};

const milestones = [
  {
    label: "站点框架上线",
    desc: "现代浅色 UI · 博客系统 · 视频背景 Hero",
    done: true,
  },
  {
    label: "真实 AI 对话",
    desc: "模型选择、文件上传、OpenAI 兼容 / Ollama 双协议接入",
    done: true,
  },
  {
    label: "站点导航",
    desc: "精选开源项目与实用站点，无广告",
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
  return (
    <div className="mx-auto max-w-3xl px-6 pt-28">
      <Reveal>
        <p className="font-grotesk text-sm font-semibold text-[#2aa11d]">ABOUT</p>
        <h1 className="font-grotesk mt-1 text-4xl font-bold tracking-[-1.5px] md:text-5xl">
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

      <Reveal delay={0.15}>
        <h2 className="font-grotesk mt-14 text-2xl font-bold">路线图</h2>
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
            想试试真实的 AI 对话？带上你的模型服务地址来。
          </p>
          <Link
            href="/chat"
            className="btn-black mt-4 inline-block rounded-lg px-7 py-3 text-sm font-semibold"
          >
            去对话页 →
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
