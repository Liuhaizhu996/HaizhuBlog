import { NextResponse } from "next/server";
import {
  addMessage,
  forwardToAdmin,
  getNickname,
  isValidSession,
  ensurePollingLoop,
} from "@/lib/tgchat";

/** 对应原项目 POST /api/chat/send：访客消息入库并转发到管理员 Telegram */
export async function POST(req: Request) {
  ensurePollingLoop();
  try {
    const body = await req.json();
    const sid = body?.session_id;
    const content = String(body?.content ?? "").trim();
    if (!isValidSession(sid)) {
      return NextResponse.json({ success: false, error: "会话标识无效" }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ success: false, error: "消息不能为空" }, { status: 400 });
    }

    const result = await forwardToAdmin(sid, getNickname(sid), content);
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
    }
    addMessage(sid, "in", content);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "请求格式错误" }, { status: 400 });
  }
}
