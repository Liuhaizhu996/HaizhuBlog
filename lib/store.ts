import fs from "fs";
import path from "path";
import { linkGroups as defaultLinkGroups, type LinkGroup } from "@/lib/links";

/**
 * 轻量 JSON 数据层：所有可在后台管理的数据都落在 data/ 目录。
 * 首次读取时用代码内置的默认值播种，之后以文件为准。
 */

const dataDir = path.join(process.cwd(), "data");

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

export function readJson<T>(name: string, fallback: T): T {
  try {
    const file = path.join(dataDir, name);
    if (!fs.existsSync(file)) return fallback;
    return { ...fallback, ...JSON.parse(fs.readFileSync(file, "utf-8")) };
  } catch {
    return fallback;
  }
}

export function writeJson(name: string, value: unknown) {
  ensureDir();
  fs.writeFileSync(
    path.join(dataDir, name),
    JSON.stringify(value, null, 2),
    "utf-8"
  );
}

/* ---------- 站点设置 ---------- */

export type SiteSettings = {
  ai: {
    provider: "openai" | "ollama";
    baseUrl: string;
    apiKey: string;
    models: string[];
  };
  tgbot: {
    enabled: boolean;
    botUsername: string; // 不带 @ 的 Telegram 机器人用户名
    botToken: string; // BotFather 下发的令牌（仅存服务器）
    adminId: string; // 管理员的 Telegram 用户 ID（接收访客消息）
    greeting: string;
    sourceUrl: string;
  };
  contacts: {
    wechat: string;
    qq: string;
    blog: string;
    telegram: string;
    whatsapp: string;
  };
};

export const DEFAULT_SETTINGS: SiteSettings = {
  ai: {
    provider: "openai",
    baseUrl: "",
    apiKey: "",
    models: ["gpt-4o-mini", "gpt-4o", "deepseek-chat", "qwen-plus"],
  },
  tgbot: {
    enabled: true,
    botUsername: "",
    botToken: "",
    adminId: "",
    greeting: "你好！这里是站长的在线客服，直接输入消息即可，我会尽快回复 👋",
    sourceUrl: "https://github.com/xiaoyu132223/Customer-service-bot",
  },
  contacts: {
    wechat: "1569757091",
    qq: "2326844998",
    blog: "www.haizhuapi.com",
    telegram: "+1 445 285 8413",
    whatsapp: "+1 (415) 521-2551",
  },
};

export function getSettings(): SiteSettings {
  const raw = readJson<SiteSettings>("settings.json", DEFAULT_SETTINGS);
  return {
    ai: { ...DEFAULT_SETTINGS.ai, ...raw.ai },
    tgbot: { ...DEFAULT_SETTINGS.tgbot, ...raw.tgbot },
    contacts: { ...DEFAULT_SETTINGS.contacts, ...raw.contacts },
  };
}

export function saveSettings(settings: SiteSettings) {
  writeJson("settings.json", settings);
}

/* ---------- 站点导航 ---------- */

export function getLinkGroups(): LinkGroup[] {
  const raw = readJson<{ groups: LinkGroup[] }>("links.json", {
    groups: defaultLinkGroups,
  });
  return Array.isArray(raw.groups) && raw.groups.length
    ? raw.groups
    : defaultLinkGroups;
}

export function saveLinkGroups(groups: LinkGroup[]) {
  writeJson("links.json", { groups });
}
