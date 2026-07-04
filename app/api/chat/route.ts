import { NextResponse } from "next/server";
import { getSettings } from "@/lib/store";

/**
 * 站内 AI 对话接口。
 *
 * 支持两种真实后端（参考 NextChat / Open WebUI 的接入方式）：
 *  - OpenAI 兼容接口：{baseUrl}/v1/chat/completions（DeepSeek、通义、硅基流动、
 *    OneAPI、LM Studio、vLLM 等均兼容此协议）
 *  - Ollama 本地服务：{baseUrl}/api/chat
 *
 * 配置优先级：请求体里的用户配置（浏览器本地保存）> 服务端环境变量
 *  AI_PROVIDER=openai|ollama, AI_BASE_URL, AI_API_KEY, AI_MODELS(逗号分隔)
 *
 * 未配置任何后端时返回演示回复（JSON，带 demo: true 标记）。
 * 真实后端统一转为 text/plain 流式输出，前端按增量渲染。
 */

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/**
 * 模型服务仅由站长控制：后台管理配置 > 环境变量。
 * 前台不再接受访客自定义服务地址/密钥。
 */
function resolveConfig() {
  const server = getSettings().ai;
  const provider = server.baseUrl
    ? server.provider
    : (process.env.AI_PROVIDER as "openai" | "ollama") || "openai";
  const baseUrl = (server.baseUrl || process.env.AI_BASE_URL || "").replace(
    /\/+$/,
    ""
  );
  const apiKey = server.apiKey || process.env.AI_API_KEY || "";
  return { provider, baseUrl, apiKey };
}

/** 把上游的 OpenAI SSE 流转换为纯文本增量流 */
function openaiToTextStream(upstream: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const data = line.trim();
            if (!data.startsWith("data:")) continue;
            const payload = data.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              const delta: string =
                json.choices?.[0]?.delta?.content ??
                json.choices?.[0]?.message?.content ??
                "";
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // 忽略无法解析的行
            }
          }
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });
}

/** 把 Ollama 的 NDJSON 流转换为纯文本增量流 */
function ollamaToTextStream(upstream: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              const delta: string = json.message?.content ?? "";
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // 忽略无法解析的行
            }
          }
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });
}

/* ---------- 演示模式 ---------- */

const cannedReplies: Array<{ keywords: string[]; reply: string }> = [
  {
    keywords: ["网站", "站点", "能做什么", "介绍"],
    reply:
      "HaizhuAI 是一个「不止于博客」的站点：\n\n1. 📚 文章板块：分享资讯、教程与日常；\n2. 🤖 AI 对话：支持选择模型、上传文件（就是当前页面）；\n3. 🧭 站点导航：精选开源项目与实用工具。\n\n站长接入模型服务后，我就能真实回答问题了，敬请期待。",
  },
  {
    keywords: ["提示词", "prompt"],
    reply:
      "写好提示词的五个基本原则：\n\n1. 说清楚背景；\n2. 给出格式要求；\n3. 提供示例；\n4. 分步骤引导；\n5. 不满意就追问迭代。\n\n站内有一篇《写好提示词的五个基本原则》教程，推荐去看看！",
  },
  {
    keywords: ["开源", "工具", "推荐", "模型"],
    reply:
      "几款值得关注的开源 AI 对话工具：\n\n• Cherry Studio —— 多模型桌面客户端；\n• NextChat —— 轻量易部署；\n• Open WebUI —— 功能全面的自托管平台；\n• LobeChat —— 高颜值聊天框架；\n• Ollama —— 本地一键跑大模型。\n\n本站的对话功能就参考了它们的设计。",
  },
];

const fallbackReply =
  "收到！当前是演示模式 🚧\n\n站长还没有接入真实的模型服务，等接入后我就能认真回答你的每一个问题啦。你可以先逛逛「文章」和「站点导航」板块。";

function demoReply(messages: ChatMessage[]) {
  const lastUser =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const matched = cannedReplies.find(({ keywords }) =>
    keywords.some((k) => lastUser.toLowerCase().includes(k.toLowerCase()))
  );
  return NextResponse.json({ reply: matched?.reply ?? fallbackReply, demo: true });
}

/* ---------- 入口 ---------- */

export async function POST(req: Request) {
  let messages: ChatMessage[] = [];
  let model = "";

  try {
    const body = await req.json();
    if (Array.isArray(body?.messages)) messages = body.messages;
    model = typeof body?.model === "string" ? body.model : "";
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const { provider, baseUrl, apiKey } = resolveConfig();

  // 模型必须在站长开放的列表内，否则回退到第一个
  const allowed = getSettings().ai.models;
  if (allowed.length && !allowed.includes(model)) model = allowed[0];

  if (!baseUrl) return demoReply(messages);

  try {
    let upstream: Response;

    if (provider === "ollama") {
      upstream = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, stream: true }),
        signal: AbortSignal.timeout(120_000),
      });
    } else {
      upstream = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({ model, messages, stream: true }),
        signal: AbortSignal.timeout(120_000),
      });
    }

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      return NextResponse.json(
        {
          error: `模型服务返回 ${upstream.status}：${detail.slice(0, 300) || "无详细信息"}`,
        },
        { status: 502 }
      );
    }

    const textStream =
      provider === "ollama"
        ? ollamaToTextStream(upstream.body)
        : openaiToTextStream(upstream.body);

    return new Response(textStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `无法连接模型服务：${msg}` },
      { status: 502 }
    );
  }
}
