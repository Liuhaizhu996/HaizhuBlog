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

/* ---------- AI 工具广场 ---------- */

export type AiTool = {
  name: string;
  desc: string;
  status: string; // 徽章文字：已上线 / 规划中 / 敬请期待…
  live: boolean; // true 时徽章为绿色
  url: string; // 以 / 开头为站内跳转，http(s):// 为外链
  locked: boolean; // 内置站内跳转：地址不可在后台修改
};

export const DEFAULT_TOOLS: AiTool[] = [
  {
    name: "站内 AI 对话",
    desc: "选择模型、上传文件，真实可用的站内对话。接入任意 OpenAI 兼容接口或本地 Ollama。",
    status: "已上线",
    live: true,
    url: "/chat",
    locked: true,
  },
  {
    name: "文件处理",
    desc: "在对话中点 + 号上传文本 / 代码文件，让 AI 帮你总结、审查、改写、提取信息。",
    status: "已上线",
    live: true,
    url: "/chat",
    locked: true,
  },
  {
    name: "模型列表自动获取",
    desc: "配置服务地址后一键拉取可用模型，不用手动敲模型名。",
    status: "已上线",
    live: true,
    url: "https://test.haizhuapi.com",
    locked: false,
  },
  {
    name: "HaizhuDesign 生图",
    desc: "AI 图像生成工作台，输入提示词即刻出图。",
    status: "已上线",
    live: true,
    url: "https://design.haizhuai.art",
    locked: false,
  },
  {
    name: "提示词实验室",
    desc: "收藏、管理、测试你的提示词模板，配合教程文章一起练习。",
    status: "规划中",
    live: false,
    url: "",
    locked: false,
  },
  {
    name: "文章 AI 助读",
    desc: "在文章页一键唤起 AI：总结全文、解释术语、生成练习题。",
    status: "规划中",
    live: false,
    url: "",
    locked: false,
  },
];

export function getTools(): AiTool[] {
  const raw = readJson<{ tools: AiTool[] }>("tools.json", {
    tools: DEFAULT_TOOLS,
  });
  return Array.isArray(raw.tools) && raw.tools.length
    ? raw.tools
    : DEFAULT_TOOLS;
}

export function saveTools(tools: AiTool[]) {
  writeJson("tools.json", { tools });
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
