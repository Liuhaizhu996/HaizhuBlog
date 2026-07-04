import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "AI 工具",
  description: "HaizhuAI 集成的 AI 工具广场：站内对话已支持选模型与传文件。",
};

const tools = [
  {
    name: "站内 AI 对话",
    desc: "已支持选择模型与上传文件。接入任意 OpenAI 兼容接口（DeepSeek / 通义 / 硅基流动…）或本地 Ollama，密钥仅存于浏览器。",
    status: "已上线",
    live: true,
    href: "/chat",
  },
  {
    name: "文件处理",
    desc: "在对话中点 + 号上传文本 / 代码文件，让 AI 帮你总结、审查、改写、提取信息。",
    status: "已上线",
    live: true,
    href: "/chat",
  },
  {
    name: "模型列表自动获取",
    desc: "配置服务地址后一键拉取可用模型（/v1/models 或 Ollama tags），不用手动敲模型名。",
    status: "已上线",
    live: true,
    href: "/chat",
  },
  {
    name: "提示词实验室",
    desc: "收藏、管理、测试你的提示词模板，配合教程文章一起练习。",
    status: "规划中",
    live: false,
    href: null,
  },
  {
    name: "文章 AI 助读",
    desc: "在文章页一键唤起 AI：总结全文、解释术语、生成练习题。",
    status: "规划中",
    live: false,
    href: null,
  },
  {
    name: "更多工具…",
    desc: "参考 Cherry Studio / LobeChat 等开源项目，持续把好用的能力搬进来。",
    status: "敬请期待",
    live: false,
    href: null,
  },
];

export default function ToolsPage() {
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
          第一批以「站内对话」为核心的能力已经上线，后续会参考优秀的开源项目持续扩充。
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 pb-10 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, i) => {
          const card = (
            <div className="card-soft flex h-full flex-col p-6">
              <span
                className={`self-start rounded-md px-2.5 py-1 text-xs font-semibold ${
                  tool.live
                    ? "bg-[rgba(90,225,76,0.2)] text-[#1d7a12]"
                    : "bg-cloud text-slate-mid"
                }`}
              >
                {tool.status}
              </span>
              <h3 className="font-grotesk mt-4 text-lg font-bold">{tool.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-mid">
                {tool.desc}
              </p>
              {tool.href && (
                <span className="mt-4 text-sm font-semibold text-black">
                  立即使用 →
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
