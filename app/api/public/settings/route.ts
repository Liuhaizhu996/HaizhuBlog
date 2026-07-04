import { NextResponse } from "next/server";
import { getSettings } from "@/lib/store";

/**
 * 公开的站点设置（不含任何密钥）：
 * 客服浮窗、联系方式、以及“站点是否内置了 AI 服务”的状态。
 */
export async function GET() {
  const s = getSettings();
  return NextResponse.json({
    tgbot: {
      enabled: s.tgbot.enabled,
      botUsername: s.tgbot.botUsername,
      greeting: s.tgbot.greeting,
    },
    contacts: s.contacts,
    serverAi: {
      configured: Boolean(s.ai.baseUrl || process.env.AI_BASE_URL),
      models: s.ai.models,
    },
  });
}
