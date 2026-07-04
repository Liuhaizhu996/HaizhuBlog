import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminToken,
  isAdminRequest,
  isDefaultPassword,
  verifyPassword,
} from "@/lib/auth";

/** GET：查询当前登录状态 */
export async function GET(req: Request) {
  return NextResponse.json({
    authed: isAdminRequest(req),
    defaultPassword: isDefaultPassword(),
  });
}

/** POST：登录 */
export async function POST(req: Request) {
  let password = "";
  try {
    const body = await req.json();
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

/** DELETE：退出登录 */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
