"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  "介绍一下这个网站能做什么",
  "怎么写好一段提示词？",
  "推荐几款开源 AI 对话工具",
];

let idCounter = 1;

export default function ChatShell() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content:
        "你好，我是 HaizhuAI 的 AI 助手 ✒️\n\n目前我还是一个界面雏形，真正的开源大模型正在接入中。你可以先试试发送消息，感受一下交互；等模型接入后，我就能真正回答你的问题啦。",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    setMessages((prev) => [
      ...prev,
      { id: idCounter++, role: "user", content },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content }].map(
            ({ role, content }) => ({ role, content })
          ),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: idCounter++, role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: idCounter++,
          role: "assistant",
          content: "抱歉，出了点小问题，请稍后再试。",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      {/* 头部 */}
      <div className="mb-8 text-center">
        <p className="text-xs font-bold tracking-[0.3em] text-vermilion">
          DIALOGUE / 对话
        </p>
        <h1 className="font-serif-display mt-2 text-3xl font-black md:text-4xl">
          与 AI 对话
        </h1>
        <p className="mt-3 text-sm text-ink-faint">
          界面雏形 · 开源模型接入中 · 敬请期待
        </p>
      </div>

      {/* 消息区（内部滚动，避免整页被顶出视口） */}
      <div
        ref={scrollRef}
        className="flex max-h-[56vh] min-h-[50vh] flex-col gap-4 overflow-y-auto border-2 border-ink bg-[#fffdf8] p-5 md:p-7"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed md:max-w-[75%] ${
                  msg.role === "user"
                    ? "bg-ink text-paper"
                    : "border border-rule bg-paper text-ink-soft"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 输入中指示 */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-1.5 border border-rule bg-paper px-4 py-3.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-vermilion"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* 快捷建议 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="border border-rule bg-[#fffdf8] px-4 py-2 text-xs text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            {s}
          </button>
        ))}
      </div>

      {/* 输入框 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mb-10 mt-4 flex items-center gap-3 border-2 border-ink bg-[#fffdf8] p-2 pl-5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你想问的问题…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-vermilion px-5 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
        >
          发送
        </button>
      </form>
    </div>
  );
}
