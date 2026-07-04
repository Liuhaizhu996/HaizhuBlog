import { NextResponse } from "next/server";
import { getSettings } from "@/lib/store";
import { isAdminRequest, unauthorized } from "@/lib/auth";
import { modelListCandidates } from "@/lib/ai";

/**
 * 拉取模型列表（仅管理员，用于后台「自动获取」按钮）：
 *  - OpenAI 兼容：GET {base}/v1/models（失败再试 {base}/models）
 *  - Ollama：GET {base}/api/tags
 * 地址会自动归一化（允许带 /v1、/v1/chat/completions 等常见后缀）。
 * 失败时返回每个候选地址的具体错误，便于排查。
 */
export async function POST(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();

  let provider: "openai" | "ollama" = "openai";
  let baseUrl = "";
  let apiKey = "";

  try {
    const body = await req.json().catch(() => ({}));
    const userBase = body?.config?.baseUrl?.trim() || "";
    if (userBase) {
      provider = body?.config?.provider === "ollama" ? "ollama" : "openai";
      baseUrl = userBase;
      apiKey = body?.config?.apiKey?.trim() || "";
    } else {
      // 未显式指定时，用第一个已配置的渠道或环境变量
      const first = getSettings().ai.providers.find((p) => p.baseUrl);
      provider =
        first?.provider ??
        (process.env.AI_PROVIDER === "ollama" ? "ollama" : "openai");
      baseUrl = first?.baseUrl || process.env.AI_BASE_URL || "";
      apiKey = first?.apiKey || process.env.AI_API_KEY || "";
    }
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  if (!baseUrl) {
    return NextResponse.json({ error: "请先填写服务地址" }, { status: 400 });
  }
  if (!/^https?:\/\//.test(baseUrl.trim())) {
    return NextResponse.json(
      { error: "服务地址需以 http:// 或 https:// 开头" },
      { status: 400 }
    );
  }

  const attempts: string[] = [];

  for (const url of modelListCandidates(provider, baseUrl)) {
    try {
      const res = await fetch(url, {
        headers:
          provider === "openai" && apiKey
            ? { Authorization: `Bearer ${apiKey}` }
            : undefined,
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        attempts.push(`${url} → HTTP ${res.status} ${detail.slice(0, 120)}`);
        continue;
      }
      const data = await res.json();
      const models: string[] =
        provider === "ollama"
          ? (data.models ?? [])
              .map((m: { name?: string }) => m.name)
              .filter(Boolean)
          : (data.data ?? [])
              .map((m: { id?: string }) => m.id)
              .filter(Boolean);
      if (models.length) return NextResponse.json({ models });
      attempts.push(`${url} → 请求成功但未返回模型`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      attempts.push(
        `${url} → ${msg.includes("aborted") || msg.includes("timeout") ? "连接超时（15s）" : msg}`
      );
    }
  }

  return NextResponse.json(
    { error: `获取模型列表失败：\n${attempts.join("\n")}` },
    { status: 502 }
  );
}
