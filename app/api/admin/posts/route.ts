import { NextResponse } from "next/server";
import { isAdminRequest, unauthorized } from "@/lib/auth";
import {
  getAllPosts,
  getPostRaw,
  savePost,
  deletePost,
} from "@/lib/posts";

/** GET：列出全部文章；?slug=xxx 取单篇原始 Markdown 供编辑 */
export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (slug) {
    const post = getPostRaw(slug);
    if (!post) return NextResponse.json({ error: "文章不存在" }, { status: 404 });
    return NextResponse.json({ post });
  }
  return NextResponse.json({ posts: getAllPosts() });
}

/** POST：新建或更新文章 */
export async function POST(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const body = await req.json();
    const slug = savePost({
      slug: String(body.slug ?? ""),
      title: String(body.title ?? "未命名"),
      date: String(body.date ?? new Date().toISOString().slice(0, 10)),
      category: String(body.category ?? "日常"),
      excerpt: String(body.excerpt ?? ""),
      content: String(body.content ?? ""),
    });
    return NextResponse.json({ ok: true, slug });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "保存失败";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

/** DELETE：?slug=xxx 删除文章 */
export async function DELETE(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "缺少 slug" }, { status: 400 });
  try {
    deletePost(slug);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "删除失败";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
