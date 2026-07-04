"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMark, ArrowUp } from "@/components/icons";

type WidgetData = {
  tgbot: {
    enabled: boolean;
    botUsername: string;
    greeting: string;
    embedded: boolean;
  };
  contacts: {
    wechat: string;
    qq: string;
    blog: string;
    telegram: string;
    whatsapp: string;
  };
};

type Msg = {
  id: number;
  direction: "in" | "out";
  content: string;
  ts: number;
};

const SID_KEY = "hz_chat_sid";
const NAME_KEY = "hz_chat_name";

function getSid(): string {
  let sid = localStorage.getItem(SID_KEY);
  if (!sid) {
    sid = `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(SID_KEY, sid);
  }
  return sid;
}

/**
 * 右下角客服浮窗。
 * 后台配置了 Bot Token + 管理员 ID 时 → 站内双向聊天
 * （Customer-service-bot 机制：消息转发 TG，管理员引用回复送回网页）；
 * 未配置时 → 退化为 t.me 链接 + 联系方式卡片。
 */
export default function ChatWidget() {
  const [data, setData] = useState<WidgetData | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState("");

  /* 双向聊天状态 */
  const [nickname, setNickname] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
    setNickname(localStorage.getItem(NAME_KEY) ?? "");
  }, []);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/tgchat/poll?session_id=${encodeURIComponent(getSid())}`
      );
      const d = await res.json();
      if (Array.isArray(d.messages)) setMessages(d.messages);
    } catch {
      /* 网络抖动时静默，下轮再试 */
    }
  }, []);

  /* 打开窗口且已登记昵称时，每 3 秒轮询新消息（对应原项目前端轮询） */
  useEffect(() => {
    if (!open || !nickname || !data?.tgbot.embedded) return;
    poll();
    const timer = setInterval(poll, 3000);
    return () => clearInterval(timer);
  }, [open, nickname, data?.tgbot.embedded, poll]);

  /* 新消息时滚到底部 */
  useEffect(() => {
    if (messages.length !== lastCount.current) {
      lastCount.current = messages.length;
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  if (!data?.tgbot.enabled) return null;

  const embedded = data.tgbot.embedded;
  const botLink = data.tgbot.botUsername
    ? `https://t.me/${data.tgbot.botUsername}`
    : "";
  const waLink = data.contacts.whatsapp
    ? `https://wa.me/${data.contacts.whatsapp.replace(/[^\d]/g, "")}`
    : "";

  function copy(label: string, value: string) {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(""), 1500);
    });
  }

  async function startChat(e: React.FormEvent) {
    e.preventDefault();
    const name = nameInput.trim() || "访客";
    try {
      await fetch("/api/tgchat/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: getSid(), nickname: name }),
      });
      localStorage.setItem(NAME_KEY, name);
      setNickname(name);
    } catch {
      setErrMsg("连接失败，请稍后再试");
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setErrMsg("");
    try {
      const res = await fetch("/api/tgchat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: getSid(), content }),
      });
      const d = await res.json();
      if (d.success) {
        setInput("");
        poll();
      } else {
        setErrMsg(d.error ?? "发送失败");
      }
    } catch {
      setErrMsg("网络异常，发送失败");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="flex w-[340px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-2xl border border-hairline bg-white shadow-2xl shadow-black/15"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between bg-black px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lime/90 text-sm">
                  💬
                </span>
                <div>
                  <p className="text-sm font-semibold leading-none">在线客服</p>
                  <p className="mt-1 text-[11px] text-white/60">
                    {embedded ? "站长通过 Telegram 实时回复" : "Telegram 双向机器人"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="关闭"
                className="text-white/60 hover:text-white"
              >
                <XMark className="h-4 w-4" />
              </button>
            </div>

            {embedded ? (
              nickname ? (
                <>
                  {/* 消息区 */}
                  <div
                    ref={scrollRef}
                    className="flex h-[320px] flex-col gap-2.5 overflow-y-auto bg-cloud/40 p-4"
                  >
                    <div className="max-w-[85%] self-start rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 text-sm leading-relaxed text-black/80 shadow-sm">
                      {data.tgbot.greeting}
                    </div>
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                          m.direction === "in"
                            ? "self-end rounded-br-md bg-black text-white"
                            : "self-start rounded-tl-md bg-white text-black/80"
                        }`}
                      >
                        {m.content}
                      </div>
                    ))}
                  </div>

                  {errMsg && (
                    <p className="border-t border-hairline bg-red-50 px-4 py-2 text-xs text-red-500">
                      {errMsg}
                    </p>
                  )}

                  {/* 输入区 */}
                  <form
                    onSubmit={send}
                    className="flex items-center gap-2 border-t border-hairline bg-white p-2.5"
                  >
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="输入消息…"
                      className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-black/35"
                    />
                    <button
                      type="submit"
                      disabled={sending || !input.trim()}
                      aria-label="发送"
                      className="btn-black flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </>
              ) : (
                /* 昵称登记（对应原项目 login） */
                <form onSubmit={startChat} className="p-5">
                  <div className="rounded-2xl rounded-tl-md bg-cloud px-3.5 py-3 text-sm leading-relaxed text-black/80">
                    {data.tgbot.greeting}
                  </div>
                  <label className="mt-4 block text-xs font-semibold text-slate-mid">
                    怎么称呼你？
                    <input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="你的昵称（可留空）"
                      maxLength={30}
                      className="mt-1.5 w-full rounded-lg border border-hairline px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-black"
                    />
                  </label>
                  <button
                    type="submit"
                    className="btn-black mt-3 w-full rounded-xl py-2.5 text-sm font-semibold"
                  >
                    开始对话
                  </button>
                  {errMsg && (
                    <p className="mt-2 text-xs text-red-500">{errMsg}</p>
                  )}
                </form>
              )
            ) : (
              /* 未配置 Bot：退化为链接 + 联系方式 */
              <div>
                <div className="px-4 pt-4">
                  <div className="rounded-2xl rounded-tl-md bg-cloud px-3.5 py-3 text-sm leading-relaxed text-black/80">
                    {data.tgbot.greeting}
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  {botLink ? (
                    <a
                      href={botLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-black block rounded-xl px-4 py-3 text-center text-sm font-semibold"
                    >
                      打开 Telegram 对话 →
                    </a>
                  ) : (
                    <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700">
                      站长还没配置机器人（后台 → 客服与联系方式）。
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 联系方式快捷行 */}
            <div className="grid grid-cols-2 gap-2 border-t border-hairline bg-white p-3 text-xs">
              <button
                onClick={() => copy("WeChat", data.contacts.wechat)}
                className="rounded-lg border border-hairline px-3 py-2 text-slate-mid transition hover:border-black hover:text-black"
              >
                {copied === "WeChat" ? "✅ 已复制" : `微信 ${data.contacts.wechat}`}
              </button>
              <button
                onClick={() => copy("QQ", data.contacts.qq)}
                className="rounded-lg border border-hairline px-3 py-2 text-slate-mid transition hover:border-black hover:text-black"
              >
                {copied === "QQ" ? "✅ 已复制" : `QQ ${data.contacts.qq}`}
              </button>
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-hairline px-3 py-2 text-center text-slate-mid transition hover:border-black hover:text-black"
                >
                  WhatsApp
                </a>
              )}
              {data.contacts.blog && (
                <a
                  href={`https://${data.contacts.blog.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-hairline px-3 py-2 text-center text-slate-mid transition hover:border-black hover:text-black"
                >
                  {data.contacts.blog}
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 浮动按钮 */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        aria-label="联系客服"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-2xl text-white shadow-xl shadow-black/25"
      >
        {open ? <XMark className="h-5 w-5" /> : "💬"}
      </motion.button>
    </div>
  );
}
