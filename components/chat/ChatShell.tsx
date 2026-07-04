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
        "你好，我是海竹小站的 AI 助手 🌊\n\n目前我还是一个界面雏形，真正的开源大模型正在接入中。你可以先试试发送消息，感受一下交互；等模型接入后，我就能真正回答你的问题啦。",
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
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-black md:text-3xl">
          站内 <span className="text-aurora">AI 对话</span>
        </h1>
        <p className="mt-2 text-sm text-[--color-mist]">
          界面雏形 · 开源模型接入中 · 敬请期待
        </p>
      </div>

      {/* 消息区（内部滚动，避免整页被顶出视口） */}
      <div
        ref={scrollRef}
        className="glass flex max-h-[56vh] min-h-[50vh] flex-col gap-4 overflow-y-auto rounded-3xl p-5 md:p-7"
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
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[75%] ${
                  msg.role === "user"
                    ? "rounded-br-md bg-gradient-to-br from-[#7c5cff] to-[#5a8dff] text-white"
                    : "rounded-bl-md border border-white/10 bg-white/5 text-[#d6d6e7]"
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
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#38d4ff]"
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
            className="glass glass-hover rounded-full px-4 py-2 text-xs text-[--color-mist] hover:text-white"
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
        className="glass mb-10 mt-4 flex items-center gap-3 rounded-2xl p-2 pl-5 focus-within:border-[#7c5cff]/50"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你想问的问题…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/25"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-aurora rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          发送
        </button>
      </form>
    </div>
  );
}
