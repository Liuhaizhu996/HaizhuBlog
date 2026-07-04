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
      // 双向对话是否可用（token 与管理员 ID 均已在后台配置；不下发凭据本身）
      embedded: Boolean(s.tgbot.botToken && s.tgbot.adminId),
    },
    contacts: s.contacts,
    serverAi: {
      configured: Boolean(
        s.ai.providers.some((p) => p.baseUrl) || process.env.AI_BASE_URL
      ),
      // 只下发展示用的模型别名，不暴露渠道与实际模型
      models: s.ai.models.map((m) => m.alias),
    },
  });
}
