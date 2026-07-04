import { NextResponse } from "next/server";
import { isAdminRequest, unauthorized } from "@/lib/auth";
import { getLinkGroups, saveLinkGroups } from "@/lib/store";
import type { LinkGroup } from "@/lib/links";

/** GET：当前导航分组 */
export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  return NextResponse.json({ groups: getLinkGroups() });
}

/** PUT：整体保存导航分组（参考 Navlink 的分组式管理） */
export async function PUT(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const body = await req.json();
    const groups = (body?.groups ?? []) as LinkGroup[];
    if (!Array.isArray(groups)) throw new Error("格式错误");
    const cleaned = groups
      .map((g) => ({
        title: String(g.title ?? "").trim(),
        links: (Array.isArray(g.links) ? g.links : [])
          .map((l) => ({
            name: String(l.name ?? "").trim(),
            desc: String(l.desc ?? "").trim(),
            url: String(l.url ?? "").trim(),
          }))
          .filter((l) => l.name && /^https?:\/\//.test(l.url)),
      }))
      .filter((g) => g.title);
    saveLinkGroups(cleaned);
    return NextResponse.json({ ok: true, groups: cleaned });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "保存失败";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
