import { NextResponse } from "next/server";
import { getAiNewsConfig, getAiNewsState, runAiNews } from "@/lib/ai-news";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return bearer === secret || req.headers.get("x-cron-secret") === secret;
}

async function handle(req: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "服务器未配置 CRON_SECRET" }, { status: 503 });
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Cron 鉴权失败" }, { status: 401 });
  }
  const config = getAiNewsConfig();
  if (!config.enabled) {
    return NextResponse.json({ ok: true, skipped: true, message: "AI 资讯自动任务未启用" });
  }
  const state = getAiNewsState();
  const lastRun = state.lastRunAt ? Date.parse(state.lastRunAt) : 0;
  if (lastRun && Date.now() - lastRun < config.intervalMinutes * 60 * 1_000) {
    return NextResponse.json({ ok: true, skipped: true, message: "尚未到后台配置的运行间隔" });
  }
  try {
    const result = await runAiNews("cron");
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cron 执行失败" },
      { status: 500 }
    );
  }
}

export const GET = handle;
export const POST = handle;
