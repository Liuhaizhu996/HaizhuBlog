import { NextResponse } from "next/server";
import { isAdminRequest, unauthorized } from "@/lib/auth";
import {
  deleteNewsDraft,
  getAiNewsConfig,
  getAiNewsState,
  getNewsDrafts,
  publishNewsDraft,
  runAiNews,
  saveAiNewsConfig,
} from "@/lib/ai-news";
import { getSettings } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function snapshot() {
  const state = getAiNewsState();
  return {
    config: getAiNewsConfig(),
    drafts: getNewsDrafts(),
    state: {
      lastRunAt: state.lastRunAt,
      lastSuccessAt: state.lastSuccessAt,
      seenCount: state.seen.length,
      runs: state.runs,
    },
    models: getSettings().ai.models.map((item) => item.alias),
  };
}

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  return NextResponse.json(snapshot());
}

export async function PUT(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const body = await req.json();
    const config = saveAiNewsConfig(body?.config ?? {});
    return NextResponse.json({ ok: true, config });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "保存失败" },
      { status: 400 }
    );
  }
}

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.action === "publish") {
      const draft = publishNewsDraft(String(body.id ?? ""));
      return NextResponse.json({ ok: true, draft });
    }
    if (body?.action === "run") {
      const result = await runAiNews("manual");
      return NextResponse.json({ ok: true, result, ...snapshot() });
    }
    return NextResponse.json({ error: "未知操作" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "操作失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const id = new URL(req.url).searchParams.get("id") ?? "";
    deleteNewsDraft(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "删除失败" },
      { status: 400 }
    );
  }
}
