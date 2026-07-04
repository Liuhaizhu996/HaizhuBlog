"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMark } from "@/components/icons";

type WidgetData = {
  tgbot: { enabled: boolean; botUsername: string; greeting: string };
  contacts: {
    wechat: string;
    qq: string;
    blog: string;
    telegram: string;
    whatsapp: string;
  };
};

/**
 * 右下角客服浮窗：小窗展示欢迎语与联系渠道，
 * 主按钮跳转 Telegram 双向客服机器人（Customer-service-bot 项目）。
 * 全部内容可在管理后台「客服与联系方式」中配置。
 */
export default function ChatWidget() {
  const [data, setData] = useState<WidgetData | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data?.tgbot.enabled) return null;

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

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="w-[320px] max-w-[calc(100vw-40px)] overflow-hidden rounded-2xl border border-hairline bg-white shadow-2xl shadow-black/15"
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
                    Telegram 双向机器人
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

            {/* 欢迎语气泡 */}
            <div className="px-4 pt-4">
              <div className="rounded-2xl rounded-tl-md bg-cloud px-3.5 py-3 text-sm leading-relaxed text-black/80">
                {data.tgbot.greeting}
              </div>
            </div>

            {/* 渠道按钮 */}
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
                  站长还没配置机器人用户名（后台 → 客服与联系方式）。
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 text-xs">
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
