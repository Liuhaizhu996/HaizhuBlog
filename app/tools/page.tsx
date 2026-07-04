import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import TiltCard from "@/components/motion/TiltCard";

export const metadata: Metadata = {
  title: "AI 工具",
  description: "海竹小站集成的开源 AI 对话工具广场。",
};

const tools = [
  {
    name: "站内 AI 对话",
    desc: "本站原生的 AI 聊天界面，界面已就绪，模型接入中。以后阅读文章遇到疑问，随时开聊。",
    status: "雏形可体验",
    statusColor: "text-[#8ee4ff] border-[#38d4ff]/30 bg-[#38d4ff]/10",
    href: "/chat",
    icon: "💬",
    ready: true,
  },
  {
    name: "Ollama 本地模型",
    desc: "计划支持连接本地 Ollama 服务，让站点直连你电脑上的开源大模型，数据不出本机。",
    status: "规划中",
    statusColor: "text-[#b9a8ff] border-[#7c5cff]/30 bg-[#7c5cff]/10",
    href: null,
    icon: "🦙",
    ready: false,
  },
  {
    name: "多模型切换",
    desc: "在 Llama、Qwen、DeepSeek 等开源模型之间自由切换，对比不同模型的回答风格。",
    status: "规划中",
    statusColor: "text-[#b9a8ff] border-[#7c5cff]/30 bg-[#7c5cff]/10",
    href: null,
    icon: "🛰️",
    ready: false,
  },
  {
    name: "提示词实验室",
    desc: "收藏、管理、测试你的提示词模板，配合教程文章一起练习。",
    status: "规划中",
    statusColor: "text-[#b9a8ff] border-[#7c5cff]/30 bg-[#7c5cff]/10",
    href: null,
    icon: "🧪",
    ready: false,
  },
  {
    name: "文章 AI 助读",
    desc: "在文章页一键唤起 AI：总结全文、解释术语、生成练习题。",
    status: "规划中",
    statusColor: "text-[#b9a8ff] border-[#7c5cff]/30 bg-[#7c5cff]/10",
    href: null,
    icon: "📖",
    ready: false,
  },
  {
    name: "更多工具…",
    desc: "站长会持续把好用的开源 AI 工具搬进来，有想要的欢迎留言告诉我。",
    status: "敬请期待",
    statusColor: "text-[#ff9ecb] border-[#ff5ca8]/30 bg-[#ff5ca8]/10",
    href: null,
    icon: "✨",
    ready: false,
  },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-32">
      <Reveal>
        <p className="text-sm font-medium tracking-widest text-[#7c5cff]">
          AI TOOLKIT
        </p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">AI 工具广场</h1>
        <p className="mt-4 max-w-xl text-[--color-mist]">
          开源 AI 对话工具会陆续集成到这里。第一批以「站内对话」为核心，
          后续逐步开放本地模型、多模型切换等能力。
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 pb-10 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, i) => {
          const card = (
            <TiltCard className="h-full">
              <div className="glass glass-hover flex h-full flex-col rounded-3xl p-7">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{tool.icon}</span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${tool.statusColor}`}
                  >
                    {tool.status}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{tool.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[--color-mist]">
                  {tool.desc}
                </p>
                {tool.ready && (
                  <span className="mt-5 text-sm font-semibold text-[#38d4ff]">
                    立即体验 →
                  </span>
                )}
              </div>
            </TiltCard>
          );

          return (
            <Reveal key={tool.name} delay={(i % 3) * 0.1}>
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
