import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isAdminRequest, unauthorized } from "@/lib/auth";

/**
 * 后台图片上传：
 *  - POST  multipart/form-data（字段 file）→ 存入 data/uploads/，返回 /uploads/<文件名>
 *  - GET   已上传图片列表（供编辑器图库复用）
 *  - DELETE ?name=xxx 删除图片
 * 图片与其他后台数据一样落在 data/ 目录（Docker 卷持久化），
 * 由 /uploads/[...path] 路由对外提供访问。
 */

const uploadsDir = path.join(process.cwd(), "data", "uploads");

const ALLOWED: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  if (!file) return NextResponse.json({ error: "缺少文件" }, { status: 400 });

  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "仅支持 PNG / JPG / GIF / WebP / AVIF 图片" },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "图片不能超过 8MB" }, { status: 400 });
  }

  // 文件名：时间戳 + 原文件名中的安全字符，避免冲突与路径注入
  const base = path
    .basename(file.name, path.extname(file.name))
    .replace(/[^a-zA-Z0-9一-鿿_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const name = `${Date.now().toString(36)}${base ? `-${base}` : ""}${ext}`;

  fs.mkdirSync(uploadsDir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(uploadsDir, name), buf);

  return NextResponse.json({ ok: true, name, url: `/uploads/${name}` });
}

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  if (!fs.existsSync(uploadsDir)) return NextResponse.json({ images: [] });
  const images = fs
    .readdirSync(uploadsDir)
    .filter((f) => Object.values(ALLOWED).includes(path.extname(f).toLowerCase()))
    .map((f) => {
      const st = fs.statSync(path.join(uploadsDir, f));
      return { name: f, url: `/uploads/${f}`, size: st.size, mtime: st.mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
  return NextResponse.json({ images });
}

export async function DELETE(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  const name = new URL(req.url).searchParams.get("name") ?? "";
  const file = path.join(uploadsDir, name);
  // 只允许删除 uploads 目录内的文件
  if (!name || path.dirname(file) !== uploadsDir) {
    return NextResponse.json({ error: "非法文件名" }, { status: 400 });
  }
  if (fs.existsSync(file)) fs.unlinkSync(file);
  return NextResponse.json({ ok: true });
}
