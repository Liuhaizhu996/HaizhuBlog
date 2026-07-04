import { NextResponse } from "next/server";
import { getMessages, isValidSession, ensurePollingLoop } from "@/lib/tgchat";

/** 对应原项目 GET /api/chat/poll：拉取会话消息（最近 50 条） */
export async function GET(req: Request) {
  ensurePollingLoop();
  const sid = new URL(req.url).searchParams.get("session_id");
  if (!isValidSession(sid)) {
    return NextResponse.json({ messages: [] });
  }
  return NextResponse.json({ messages: getMessages(sid) });
}
