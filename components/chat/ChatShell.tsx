"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Plus,
  XMark,
  Sparkle,
  ChevronDown,
} from "@/components/icons";

/* ---------- 类型与常量 ---------- */

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  attachments?: string[];
};

const MAX_FILE_SIZE = 300 * 1024; // 300KB
const TEXT_EXTS =
  ".txt,.md,.markdown,.json,.csv,.tsv,.xml,.yaml,.yml,.html,.css,.js,.jsx,.ts,.tsx,.py,.java,.go,.rs,.c,.cpp,.h,.sh,.sql,.log,.ini,.toml,.env.example";

const suggestions = [
  "介绍一下这个网站能做什么",
  "怎么写好一段提示词？",
  "推荐几款开源 AI 对话工具",
];

let idCounter = 1;

type Attachment = { name: string; size: number; content: string };

/* ---------- 组件 ---------- */

export default function ChatShell({
  initialQuestion,
}: {
  initialQuestion?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content:
        "你好，我是 HaizhuAI 的 AI 助手 👋\n\n· 顶部可切换站长开放的模型；\n· 点输入框左侧 + 号可上传文本/代码文件，让我帮你分析处理；\n· 站长未接入模型服务时，我以演示模式回复。",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState("");
  const [configured, setConfigured] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [demoMode, setDemoMode] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const sentInitial = useRef(false);

  /* 初始化：读取站长开放的模型列表 */
  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((data) => {
        const list: string[] = data?.serverAi?.models ?? [];
        setModels(list);
        setModel(list[0] ?? "");
        setConfigured(Boolean(data?.serverAi?.configured));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialQuestion && !sentInitial.current) {
      sentInitial.current = true;
      setTimeout(() => send(initialQuestion), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  /* ---------- 文件上传 ---------- */

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const next: Attachment[] = [...attachments];
    for (const file of Array.from(files)) {
      if (next.some((a) => a.name === file.name)) continue;
      if (file.size > MAX_FILE_SIZE) {
        alert(`「${file.name}」超过 300KB，暂不支持。请上传较小的文本/代码文件。`);
        continue;
      }
      try {
        const content = await file.text();
        next.push({ name: file.name, size: file.size, content });
      } catch {
        alert(`读取「${file.name}」失败`);
      }
    }
    setAttachments(next.slice(0, 5));
    if (fileRef.current) fileRef.current.value = "";
  }

  /* ---------- 发送 ---------- */

  async function send(text: string) {
    const question = text.trim();
    if ((!question && attachments.length === 0) || loading) return;

    let fullContent = question;
    if (attachments.length) {
      const fileBlocks = attachments
        .map((a) => `【附件 ${a.name}】\n\`\`\`\n${a.content}\n\`\`\``)
        .join("\n\n");
      fullContent = `${fileBlocks}\n\n${question || "请分析以上文件内容。"}`;
    }

    const userMsg: Message = {
      id: idCounter++,
      role: "user",
      content: question || "（分析上传的文件）",
      attachments: attachments.map((a) => a.name),
    };

    const history = [...messages, { ...userMsg, content: fullContent }].map(
      ({ role, content }) => ({ role, content })
    );

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachments([]);
    setLoading(true);

    const assistantId = idCounter++;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, model }),
      });

      const contentType = res.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (!res.ok || data.error) {
          setMessages((prev) => [
            ...prev,
            {
              id: assistantId,
              role: "assistant",
              content: `⚠️ ${data.error ?? "请求失败，请稍后再试。"}`,
            },
          ]);
        } else {
          setDemoMode(Boolean(data.demo));
          setMessages((prev) => [
            ...prev,
            { id: assistantId, role: "assistant", content: data.reply },
          ]);
        }
        return;
      }

      /* 流式响应：增量渲染 */
      setDemoMode(false);
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          )
        );
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "⚠️ 网络异常或服务不可达，请稍后再试。",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* ---------- 渲染 ---------- */

  return (
    <div className="flex flex-col">
      {/* 顶栏：模型选择（仅站长开放的模型） */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border border-hairline bg-cloud/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkle className="h-4 w-4 text-[#2aa11d]" />
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="font-grotesk appearance-none rounded-lg border border-hairline bg-white py-1.5 pl-3 pr-8 text-sm font-medium outline-none focus:border-black"
              aria-label="选择模型"
            >
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/50" />
          </div>
        </div>
        <span
          className={`rounded-md px-2 py-1 text-xs font-medium ${
            configured
              ? "bg-[rgba(90,225,76,0.2)] text-[#1d7a12]"
              : "bg-black/5 text-slate-mid"
          }`}
        >
          {configured ? "站点服务已接入" : "演示模式"}
        </span>
      </div>

      {/* 消息区 */}
      <div
        ref={scrollRef}
        className="flex max-h-[52vh] min-h-[44vh] flex-col gap-4 overflow-y-auto border-x border-hairline bg-white p-5 md:p-6"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[75%] ${
                  msg.role === "user"
                    ? "rounded-br-md bg-black text-white"
                    : "rounded-bl-md bg-cloud text-black/85"
                }`}
              >
                {msg.attachments && msg.attachments.length > 0 && (
                  <span className="mb-2 flex flex-wrap gap-1.5">
                    {msg.attachments.map((name) => (
                      <span
                        key={name}
                        className="rounded-md bg-white/20 px-2 py-0.5 text-xs"
                      >
                        📎 {name}
                      </span>
                    ))}
                  </span>
                )}
                {msg.content || (
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40 [animation-delay:0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40 [animation-delay:0.3s]" />
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-cloud px-4 py-3.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 演示模式提示条 */}
      {demoMode && (
        <div className="border-x border-hairline bg-[rgba(90,225,76,0.12)] px-5 py-2 text-xs text-[#1d7a12]">
          当前为演示回复 —— 站长接入模型服务后即可正常对话。
        </div>
      )}

      {/* 附件预览 */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 border-x border-hairline bg-white px-5 py-2.5">
          {attachments.map((a) => (
            <span
              key={a.name}
              className="flex items-center gap-1.5 rounded-lg border border-hairline bg-cloud px-2.5 py-1 text-xs"
            >
              📎 {a.name}
              <span className="text-black/40">
                {(a.size / 1024).toFixed(0)}KB
              </span>
              <button
                onClick={() =>
                  setAttachments((prev) =>
                    prev.filter((x) => x.name !== a.name)
                  )
                }
                aria-label={`移除 ${a.name}`}
                className="text-black/40 hover:text-black"
              >
                <XMark className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 输入区 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 rounded-b-2xl border border-hairline bg-white p-3 shadow-sm"
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          accept={TEXT_EXTS}
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          title="上传文本 / 代码文件（≤300KB）"
          aria-label="上传文件"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline text-slate-mid transition hover:border-black hover:text-black"
        >
          <Plus className="h-4 w-4" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            attachments.length ? "描述你想对文件做什么…" : "输入你的问题…"
          }
          className="flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-black/40"
        />
        <button
          type="submit"
          disabled={loading || (!input.trim() && attachments.length === 0)}
          aria-label="发送"
          className="btn-black flex h-9 w-9 shrink-0 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>

      {/* 快捷建议 */}
      <div className="mb-10 mt-4 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="rounded-full border border-hairline bg-white px-4 py-2 text-xs text-slate-mid transition hover:border-black hover:text-black"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
