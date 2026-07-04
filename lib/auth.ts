import crypto from "crypto";

/**
 * 管理员鉴权：
 * 密码来自环境变量 ADMIN_PASSWORD（未设置时使用默认值 haizhuai-admin，
 * 后台会显著提醒修改）。登录成功后种一枚 httpOnly Cookie，值为密码派生
 * 的 HMAC 摘要，服务端每次请求重新校验。
 */

export const ADMIN_COOKIE = "hz_admin";

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "haizhuai-admin";
}

export function isDefaultPassword(): boolean {
  return !process.env.ADMIN_PASSWORD;
}

export function adminToken(): string {
  return crypto
    .createHmac("sha256", "haizhuai-admin-salt")
    .update(adminPassword())
    .digest("hex");
}

export function isAdminRequest(req: Request): boolean {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ADMIN_COOKIE}=`));
  if (!match) return false;
  const value = match.slice(ADMIN_COOKIE.length + 1);
  return value === adminToken();
}

export function unauthorized() {
  return Response.json({ error: "未登录或登录已过期" }, { status: 401 });
}
