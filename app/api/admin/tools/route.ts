import { NextResponse } from "next/server";
import { isAdminRequest, unauthorized } from "@/lib/auth";
import { getTools, saveTools, type AiTool } from "@/lib/store";

/** GET：当前 AI 工具列表 */
export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  return NextResponse.json({ tools: getTools() });
}

/** PUT：整体保存 AI 工具列表（locked 项的站内跳转地址不可修改） */
export async function PUT(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const body = await req.json();
    const incoming = (body?.tools ?? []) as AiTool[];
    if (!Array.isArray(incoming)) throw new Error("格式错误");

    const current = getTools();
    const cleaned: AiTool[] = incoming
      .map((t) => {
        const locked = Boolean(t.locked);
        let url = String(t.url ?? "").trim();
        if (locked) {
          // 本站重定向不可设置：锁定项地址以当前存量（或默认值）为准
          const existing = current.find((c) => c.locked && c.name === t.name);
          url = existing?.url ?? (url.startsWith("/") ? url : "/chat");
        } else if (url && !/^https?:\/\//.test(url) && !url.startsWith("/")) {
          url = ""; // 非法地址置空（显示为无跳转卡片）
        }
        return {
          name: String(t.name ?? "").trim(),
          desc: String(t.desc ?? "").trim(),
          status: String(t.status ?? "规划中").trim() || "规划中",
          live: Boolean(t.live),
          url,
          locked,
        };
      })
      .filter((t) => t.name);

    saveTools(cleaned);
    return NextResponse.json({ ok: true, tools: cleaned });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "保存失败";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
