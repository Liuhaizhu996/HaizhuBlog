import { NextResponse } from "next/server";
import { isAdminRequest, unauthorized } from "@/lib/auth";
import { getSettings, saveSettings, type SiteSettings } from "@/lib/store";

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
    const next: SiteSettings = {
      ai: {
        provider: body?.settings?.ai?.provider === "ollama" ? "ollama" : "openai",
        baseUrl: String(body?.settings?.ai?.baseUrl ?? cur.ai.baseUrl).trim(),
        apiKey: String(body?.settings?.ai?.apiKey ?? cur.ai.apiKey).trim(),
        models: Array.isArray(body?.settings?.ai?.models)
          ? body.settings.ai.models.map(String).filter(Boolean)
          : cur.ai.models,
      },
      tgbot: {
        enabled: Boolean(body?.settings?.tgbot?.enabled),
        botUsername: String(body?.settings?.tgbot?.botUsername ?? "")
          .trim()
          .replace(/^@/, ""),
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
