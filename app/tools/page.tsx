import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import { getTools, type AiTool } from "@/lib/store";
import { ExternalLink } from "@/components/icons";

export const metadata: Metadata = {
  title: "AI 工具",
  description: "HaizhuAI 的 AI 工具广场：站内对话、文件处理、生图等。",
};

// 工具内容可在后台管理，保持动态渲染
export const dynamic = "force-dynamic";

function ToolCard({ tool }: { tool: AiTool }) {
  const external = /^https?:\/\//.test(tool.url);
  const card = (
    <div className="card-soft flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-2">
        <span
          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
            tool.live
              ? "bg-[rgba(90,225,76,0.2)] text-[#1d7a12]"
              : "bg-cloud text-slate-mid"
          }`}
        >
          {tool.status}
        </span>
        {external && (
          <ExternalLink className="h-4 w-4 shrink-0 text-black/25" />
        )}
      </div>
      <h3 className="font-grotesk mt-4 text-lg font-bold">{tool.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-mid">
        {tool.desc}
      </p>
      {tool.url && (
        <span className="mt-4 text-sm font-semibold text-black">
          立即使用 →
        </span>
      )}
    </div>
  );

  if (!tool.url) return card;
  if (external) {
    return (
      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {card}
      </a>
    );
  }
  return (
    <Link href={tool.url} className="block h-full">
      {card}
    </Link>
  );
}

export default function ToolsPage() {
  const tools = getTools();

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28">
      <Reveal>
        <p className="font-grotesk text-sm font-semibold text-[#2aa11d]">
          AI TOOLKIT
        </p>
        <h1 className="font-display mt-1 text-5xl text-black md:text-6xl">
          AI 工具广场
        </h1>
        <p className="mt-4 max-w-xl text-slate-mid">
          以「站内对话」为核心的工具集合，持续扩充中；内容由站长在后台维护。
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 pb-10 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, i) => (
          <Reveal key={tool.name} delay={(i % 3) * 0.08}>
            <ToolCard tool={tool} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
