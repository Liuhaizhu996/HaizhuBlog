import crypto from "crypto";
import { readJson, writeJson } from "@/lib/store";

/**
 * 管理员鉴权：
 * - 密码优先级：后台修改过的密码（哈希存 data/auth.json）>
 *   环境变量 ADMIN_PASSWORD > 默认值 haizhuai-admin
 * - 登录成功种 httpOnly Cookie，值为当前密码哈希派生的 HMAC，
 *   修改密码后旧 Cookie 立即失效
 */

export const ADMIN_COOKIE = "hz_admin";

const AUTH_FILE = "auth.json";

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function storedHash(): string {
  return readJson<{ passwordHash: string }>(AUTH_FILE, { passwordHash: "" })
    .passwordHash;
}

function fallbackPassword(): string {
  return process.env.ADMIN_PASSWORD || "haizhuai-admin";
}

/** 当前生效的密码哈希 */
function currentHash(): string {
  return storedHash() || sha256(fallbackPassword());
}

export function verifyPassword(password: string): boolean {
  return sha256(password) === currentHash();
}

/** 后台修改密码：写入哈希，明文不落盘 */
export function setPassword(password: string) {
  writeJson(AUTH_FILE, { passwordHash: sha256(password) });
}

/** 仍在使用默认密码（未设环境变量、也没在后台改过） */
export function isDefaultPassword(): boolean {
  return !storedHash() && !process.env.ADMIN_PASSWORD;
}

export function adminToken(): string {
  return crypto
    .createHmac("sha256", "haizhuai-admin-salt")
    .update(currentHash())
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
