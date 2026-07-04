import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminToken,
  isAdminRequest,
  setPassword,
  unauthorized,
  verifyPassword,
} from "@/lib/auth";

/** POST：修改管理员密码（需已登录 + 校验当前密码） */
export async function POST(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();

  let current = "";
  let next = "";
  try {
    const body = await req.json();
    current = String(body?.current ?? "");
    next = String(body?.next ?? "");
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  if (!verifyPassword(current)) {
    return NextResponse.json({ error: "当前密码不正确" }, { status: 401 });
  }
  if (next.length < 6) {
    return NextResponse.json({ error: "新密码至少 6 位" }, { status: 400 });
  }

  setPassword(next);

  // 用新密码派生的令牌续签 Cookie，本会话保持登录，其他会话全部失效
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
