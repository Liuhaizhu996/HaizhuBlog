import { NextResponse } from "next/server";

/**
 * 站内 AI 对话接口（雏形）。
 *
 * 当前返回内置的演示回复。后续接入真实模型时，只需替换本文件的实现，
 * 前端无需改动。可选的接入方向：
 *  - Ollama:      POST http://localhost:11434/api/chat
 *  - OpenAI 兼容:  任何提供 /v1/chat/completions 的开源推理服务
 *  - 云端 API:     在环境变量中配置密钥后转发
 */

type ChatMessage = { role: "user" | "assistant"; content: string };

const cannedReplies: Array<{ keywords: string[]; reply: string }> = [
  {
    keywords: ["网站", "站点", "能做什么", "介绍"],
    reply:
      "海竹小站是一个「不止于博客」的个人站点：\n\n1. 📚 文章板块：分享资讯、教程与日常；\n2. 🤖 AI 工具板块：逐步集成开源 AI 对话工具；\n3. 💬 对话板块：就是你现在所在的地方～\n\n目前我还是演示回复，等开源大模型接入后就能真正陪你聊天啦。",
  },
  {
    keywords: ["提示词", "prompt"],
    reply:
      "写好提示词的五个基本原则：\n\n1. 说清楚背景；\n2. 给出格式要求；\n3. 提供示例；\n4. 分步骤引导；\n5. 不满意就追问迭代。\n\n站内有一篇《写好提示词的五个基本原则》教程，推荐去看看！",
  },
  {
    keywords: ["开源", "工具", "推荐", "模型"],
    reply:
      "几款值得关注的开源 AI 对话工具：\n\n• Ollama —— 本地一键跑大模型；\n• LobeChat —— 高颜值聊天界面；\n• Open WebUI —— 功能全面的自托管平台；\n• NextChat —— 轻量易部署。\n\n本站后续会优先支持 Ollama 接入，敬请期待。",
  },
];

const fallbackReply =
  "收到！我目前还是界面雏形，真正的开源大模型正在接入中 🚧\n\n你可以先逛逛「文章」板块学点新东西，或到「AI 工具」页看看接入计划。等模型上线后，我会在这里认真回答你的每一个问题。";

export async function POST(req: Request) {
  let messages: ChatMessage[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body?.messages)) messages = body.messages;
  } catch {
    // 忽略解析错误，走兜底回复
  }

  const lastUser =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  // 模拟真实模型的思考延迟
  await new Promise((r) => setTimeout(r, 600));

  const matched = cannedReplies.find(({ keywords }) =>
    keywords.some((k) => lastUser.toLowerCase().includes(k.toLowerCase()))
  );

  return NextResponse.json({ reply: matched?.reply ?? fallbackReply });
}
