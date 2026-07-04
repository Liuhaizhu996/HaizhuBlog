import { NextResponse } from "next/server";
import { getSettings } from "@/lib/store";

/**
 * 拉取模型列表：
 *  - OpenAI 兼容：GET {baseUrl}/v1/models
 *  - Ollama：GET {baseUrl}/api/tags
 * 未配置后端时返回空列表，前端保留预设模型。
 */

export async function POST(req: Request) {
  let provider = "openai";
  let baseUrl = "";
  let apiKey = "";

  try {
    const body = await req.json();
    const server = getSettings().ai;
    const userBase = body?.config?.baseUrl?.trim() || "";
    if (userBase) {
      provider = body?.config?.provider === "ollama" ? "ollama" : "openai";
      baseUrl = userBase.replace(/\/+$/, "");
      apiKey = body?.config?.apiKey?.trim() || "";
    } else {
      provider = server.baseUrl
        ? server.provider
        : process.env.AI_PROVIDER === "ollama"
          ? "ollama"
          : "openai";
      baseUrl = (server.baseUrl || process.env.AI_BASE_URL || "").replace(/\/+$/, "");
      apiKey = server.apiKey || process.env.AI_API_KEY || "";
    }
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  if (!baseUrl) return NextResponse.json({ models: [] });

  try {
    if (provider === "ollama") {
      const res = await fetch(`${baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`服务返回 ${res.status}`);
      const data = await res.json();
      const models: string[] = (data.models ?? [])
        .map((m: { name?: string }) => m.name)
        .filter(Boolean);
      return NextResponse.json({ models });
    }

    const res = await fetch(`${baseUrl}/v1/models`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`服务返回 ${res.status}`);
    const data = await res.json();
    const models: string[] = (data.data ?? [])
      .map((m: { id?: string }) => m.id)
      .filter(Boolean);
    return NextResponse.json({ models });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `获取模型列表失败：${msg}` },
      { status: 502 }
    );
  }
}
