import { NextResponse } from "next/server";
import { isAdminRequest, unauthorized } from "@/lib/auth";
import {
  getSettings,
  saveSettings,
  type SiteSettings,
  type AiProvider,
  type ModelMapping,
} from "@/lib/store";

/** GET：完整站点设置（含 AI 密钥，仅管理员可见） */
export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  return NextResponse.json({ settings: getSettings() });
}

/** PUT：保存站点设置 */
export async function PUT(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const body = await req.json();
    const cur = getSettings();
    const rawProviders = body?.settings?.ai?.providers;
    const providers: AiProvider[] = Array.isArray(rawProviders)
      ? rawProviders
          .map((p: Partial<AiProvider>, i: number) => ({
            id: String(p.id || `p-${Date.now().toString(36)}-${i}`),
            name: String(p.name ?? "").trim() || `服务 ${i + 1}`,
            provider: p.provider === "ollama" ? ("ollama" as const) : ("openai" as const),
            baseUrl: String(p.baseUrl ?? "").trim(),
            apiKey: String(p.apiKey ?? "").trim(),
          }))
          .filter((p: AiProvider) => p.baseUrl)
      : cur.ai.providers;

    const validIds = new Set(providers.map((p) => p.id));
    const rawModels = body?.settings?.ai?.models;
    const models: ModelMapping[] = Array.isArray(rawModels)
      ? rawModels
          .map((m: Partial<ModelMapping>) => ({
            alias: String(m.alias ?? "").trim(),
            providerId: validIds.has(String(m.providerId))
              ? String(m.providerId)
              : "",
            target: String(m.target ?? "").trim(),
          }))
          .filter((m: ModelMapping) => m.alias && m.target)
      : cur.ai.models;

    const next: SiteSettings = {
      ai: { providers, models },
      tgbot: {
        enabled: Boolean(body?.settings?.tgbot?.enabled),
        botUsername: String(body?.settings?.tgbot?.botUsername ?? "")
          .trim()
          .replace(/^@/, ""),
        botToken: String(
          body?.settings?.tgbot?.botToken ?? cur.tgbot.botToken
        ).trim(),
        adminId: String(
          body?.settings?.tgbot?.adminId ?? cur.tgbot.adminId
        ).trim(),
        greeting: String(body?.settings?.tgbot?.greeting ?? cur.tgbot.greeting),
        sourceUrl: cur.tgbot.sourceUrl,
      },
      contacts: {
        wechat: String(body?.settings?.contacts?.wechat ?? cur.contacts.wechat),
        qq: String(body?.settings?.contacts?.qq ?? cur.contacts.qq),
        blog: String(body?.settings?.contacts?.blog ?? cur.contacts.blog),
        telegram: String(
          body?.settings?.contacts?.telegram ?? cur.contacts.telegram
        ),
        whatsapp: String(
          body?.settings?.contacts?.whatsapp ?? cur.contacts.whatsapp
        ),
      },
    };
    saveSettings(next);
    return NextResponse.json({ ok: true, settings: next });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "保存失败";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
