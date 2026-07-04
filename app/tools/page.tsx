import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "AI 工具",
  description: "HaizhuAI 集成的开源 AI 对话工具广场。",
};

const tools = [
  {
    no: "01",
    name: "站内 AI 对话",
    desc: "本站原生的 AI 聊天界面，界面已就绪，模型接入中。以后阅读文章遇到疑问，随时开聊。",
    status: "雏形可体验",
    href: "/chat",
    accent: true,
  },
  {
    no: "02",
    name: "Ollama 本地模型",
    desc: "计划支持连接本地 Ollama 服务，让站点直连你电脑上的开源大模型，数据不出本机。",
    status: "规划中",
    href: null,
    accent: false,
  },
  {
    no: "03",
    name: "多模型切换",
    desc: "在 Llama、Qwen、DeepSeek 等开源模型之间自由切换，对比不同模型的回答风格。",
    status: "规划中",
    href: null,
    accent: false,
  },
  {
    no: "04",
    name: "提示词实验室",
    desc: "收藏、管理、测试你的提示词模板，配合教程文章一起练习。",
    status: "规划中",
    href: null,
    accent: false,
  },
  {
    no: "05",
    name: "文章 AI 助读",
    desc: "在文章页一键唤起 AI：总结全文、解释术语、生成练习题。",
    status: "规划中",
    href: null,
    accent: false,
  },
  {
    no: "06",
    name: "更多工具…",
    desc: "站长会持续把好用的开源 AI 工具搬进来，有想要的欢迎留言告诉我。",
    status: "敬请期待",
    href: null,
    accent: false,
  },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-28">
      <Reveal>
        <p className="text-xs font-bold tracking-[0.3em] text-vermilion">
          AI TOOLKIT / 工具
        </p>
        <h1 className="font-serif-display mt-2 text-4xl font-black md:text-6xl">
          AI 工具广场
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">
          开源 AI 对话工具会陆续集成到这里。第一批以「站内对话」为核心，
          后续逐步开放本地模型、多模型切换等能力。
        </p>
        <div className="rule-strong mt-8" />
      </Reveal>

      <div className="mt-10 grid gap-5 pb-10 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, i) => {
          const card = (
            <div className="ink-card flex h-full flex-col p-7">
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
                  {tool.status}
                </span>
              </div>
              <h3 className="font-serif-display mt-5 text-xl font-bold">
                {tool.name}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-faint">
                {tool.desc}
              </p>
              {tool.href && (
                <span className="mt-5 text-sm font-bold text-vermilion">
                  立即体验 →
                </span>
              )}
            </div>
          );

          return (
            <Reveal key={tool.name} delay={(i % 3) * 0.08}>
              {tool.href ? (
                <Link href={tool.href} className="block h-full">
                  {card}
                </Link>
              ) : (
                card
              )}
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
