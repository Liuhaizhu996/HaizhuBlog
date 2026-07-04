import { getSettings, readJson, writeJson } from "@/lib/store";

/**
 * Telegram 网页双向客服 —— 移植自开源项目
 * xiaoyu132223/Customer-service-bot（FastAPI 版）的核心机制：
 *
 * 1. 访客消息按固定模板转发给管理员，文本中嵌入「🆔ID: <session_id>」；
 * 2. 服务端 getUpdates 长轮询 Telegram，检测管理员的「引用回复」，
 *    用正则从被引用消息中提取 session_id，把回复写回该会话；
 * 3. 网页端定时轮询 /api/tgchat/poll 拉取新消息。
 *
 * 存储用 data/tgchat.json（轻量 JSON，对应原项目的 SQLite）。
 * Bot Token / 管理员 ID 在管理后台「客服与联系方式」配置。
 */

export type ChatMsg = {
  id: number;
  session_id: string;
  direction: "in" | "out"; // in=访客发出, out=管理员回复
  content: string;
  ts: number;
};

type ChatData = {
  messages: ChatMsg[];
  sessions: Record<string, string>; // session_id -> nickname
  nextId: number;
};

const FILE = "tgchat.json";
const EMPTY: ChatData = { messages: [], sessions: {}, nextId: 1 };

/* 允许通过环境变量指向自建反代（api.telegram.org 被墙时可用） */
const TG_API = (process.env.TG_API_BASE || "https://api.telegram.org").replace(
  /\/+$/,
  ""
);

function load(): ChatData {
  return readJson<ChatData>(FILE, EMPTY);
}

function save(data: ChatData) {
  writeJson(FILE, data);
}

export function isValidSession(sid: unknown): sid is string {
  return typeof sid === "string" && /^[\w-]{6,64}$/.test(sid);
}

export function loginSession(sid: string, nickname: string) {
  const data = load();
  data.sessions[sid] = nickname.slice(0, 30) || "访客";
  save(data);
}

export function getNickname(sid: string): string {
  return load().sessions[sid] ?? "访客";
}

export function addMessage(
  sid: string,
  direction: "in" | "out",
  content: string
) {
  const data = load();
  data.messages.push({
    id: data.nextId++,
    session_id: sid,
    direction,
    content: content.slice(0, 4000),
    ts: Date.now(),
  });
  // 与原项目 LIMIT 50 对应：这里全局保底裁剪，避免文件无限增长
  if (data.messages.length > 800) data.messages = data.messages.slice(-500);
  save(data);
}

export function getMessages(sid: string): ChatMsg[] {
  return load()
    .messages.filter((m) => m.session_id === sid)
    .slice(-50);
}

export function botConfigured(): boolean {
  const { botToken, adminId } = getSettings().tgbot;
  return Boolean(botToken && adminId);
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** 访客消息 → 管理员 TG（沿用原项目的消息模板与 🆔ID 标记） */
export async function forwardToAdmin(
  sid: string,
  nickname: string,
  content: string
): Promise<{ ok: boolean; error?: string }> {
  const { botToken, adminId } = getSettings().tgbot;
  if (!botToken || !adminId) return { ok: false, error: "未配置机器人" };

  const text =
    `📩 <b>客户消息</b>\n` +
    `👤 称呼: ${escapeHtml(nickname)}\n` +
    `🆔ID: ${sid}\n` +
    `------------------\n` +
    `${escapeHtml(content)}`;

  try {
    const res = await fetch(`${TG_API}/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: adminId, text, parse_mode: "HTML" }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, error: `Telegram 返回 ${res.status}: ${detail.slice(0, 120)}` };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `无法连接 Telegram：${msg}` };
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * getUpdates 长轮询循环（对应原项目 telegram_polling_loop）。
 * 用 globalThis 单例保证整个 Node 进程只跑一条循环；
 * 任一 tgchat API 被访问时惰性启动。
 */
export function ensurePollingLoop() {
  const g = globalThis as { __tgPollingStarted?: boolean };
  if (g.__tgPollingStarted) return;
  g.__tgPollingStarted = true;
  void pollLoop();
}

async function pollLoop() {
  let offset = 0;
  for (;;) {
    const { enabled, botToken, adminId } = getSettings().tgbot;
    if (!enabled || !botToken || !adminId) {
      await sleep(5000);
      continue;
    }
    try {
      const res = await fetch(
        `${TG_API}/bot${botToken}/getUpdates?offset=${offset}&timeout=25`,
        { signal: AbortSignal.timeout(35_000) }
      );
      if (!res.ok) {
        await sleep(4000);
        continue;
      }
      const data = await res.json();
      for (const upd of data.result ?? []) {
        offset = Math.max(offset, (upd.update_id ?? 0) + 1);
        const msg = upd.message;
        // 只处理管理员的「引用回复」（对应原项目 reply_to_message 分支）
        if (!msg?.reply_to_message || !msg.text) continue;
        if (String(msg.from?.id ?? "") !== String(adminId)) continue;
        const original: string =
          msg.reply_to_message.text ?? msg.reply_to_message.caption ?? "";
        const match = original.match(/🆔ID: ([\w-]+)/);
        if (match) addMessage(match[1], "out", msg.text);
      }
    } catch {
      await sleep(4000);
    }
  }
}
