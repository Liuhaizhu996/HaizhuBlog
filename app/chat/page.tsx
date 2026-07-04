import type { Metadata } from "next";
import ChatShell from "@/components/chat/ChatShell";

export const metadata: Metadata = {
  title: "AI 对话",
  description: "HaizhuAI 的站内 AI 对话工具（雏形）。",
};

export default function ChatPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col px-5 pt-28">
      <ChatShell />
    </div>
  );
}
