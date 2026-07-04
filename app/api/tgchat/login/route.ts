import { NextResponse } from "next/server";
import {
  loginSession,
  isValidSession,
  botConfigured,
  ensurePollingLoop,
} from "@/lib/tgchat";

/** 对应原项目 POST /api/chat/login：登记会话昵称 */
export async function POST(req: Request) {
  ensurePollingLoop();
  try {
    const body = await req.json();
    const sid = body?.session_id;
    if (!isValidSession(sid)) {
      return NextResponse.json({ success: false, error: "会话标识无效" }, { status: 400 });
    }
    loginSession(sid, String(body?.nickname ?? "访客"));
    return NextResponse.json({ success: true, configured: botConfigured() });
  } catch {
    return NextResponse.json({ success: false, error: "请求格式错误" }, { status: 400 });
  }
}
