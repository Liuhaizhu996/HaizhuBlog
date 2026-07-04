import type { Metadata } from "next";
import ChatShell from "@/components/chat/ChatShell";

export const metadata: Metadata = {
  title: "AI 对话",
  description: "HaizhuAI 站内 AI 对话：选择站点开放的模型，支持上传文件。",
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div className="mx-auto flex max-w-4xl flex-col px-6 pt-24">
      <div className="mb-6 text-center">
        <h1 className="font-grotesk text-3xl font-bold tracking-[-1px] md:text-4xl">
          AI 对话
        </h1>
        <p className="mt-2 text-sm text-slate-mid">
          选择模型 · 上传文件 · 模型服务由站长统一配置
        </p>
      </div>
      <ChatShell initialQuestion={q} />
    </div>
  );
}
