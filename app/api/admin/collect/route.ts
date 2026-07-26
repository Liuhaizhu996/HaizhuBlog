import { NextResponse } from "next/server";
import { isAdminRequest, unauthorized } from "@/lib/auth";

/**
 * 后台「AI 采集改写」的联网能力（仅管理员）：
 *  - action=search：关键词联网搜索（DuckDuckGo HTML 版，失败回退 Bing），
 *    返回新闻/网页/论坛的标题、链接、摘要。
 *  - action=fetch：抓取所选网页正文，粗提取为纯文本供大模型改写。
 * 改写本身复用站内 /api/chat（后台「AI 模型」里配置的渠道），
 * 因此不需要额外的 LLM 密钥。
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

type SearchResult = { title: string; url: string; snippet: string };

/* ---------- 工具 ---------- */

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

/* ---------- 联网搜索 ---------- */

/** DuckDuckGo HTML 版：无需密钥，返回 result__a / result__snippet 结构 */
async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
    { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15_000) }
  );
  if (!res.ok) throw new Error(`DuckDuckGo HTTP ${res.status}`);
  const html = await res.text();

  const results: SearchResult[] = [];
  const linkRe =
    /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  const snippetRe =
    /<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
  const snippets: string[] = [];
  for (let m; (m = snippetRe.exec(html)); ) snippets.push(stripTags(m[1]));

  let i = 0;
  for (let m; (m = linkRe.exec(html)) && results.length < 12; i++) {
    let url = decodeEntities(m[1]);
    // DDG 的跳转链接形如 //duckduckgo.com/l/?uddg=<真实地址>
    const uddg = url.match(/[?&]uddg=([^&]+)/);
    if (uddg) url = decodeURIComponent(uddg[1]);
    if (!/^https?:\/\//.test(url)) continue;
    results.push({ title: stripTags(m[2]), url, snippet: snippets[i] ?? "" });
  }
  return results;
}

/** Bing 兜底：解析 b_algo 结果块 */
async function searchBing(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `https://www.bing.com/search?q=${encodeURIComponent(query)}&setlang=zh-hans`,
    { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15_000) }
  );
  if (!res.ok) throw new Error(`Bing HTTP ${res.status}`);
  const html = await res.text();

  const results: SearchResult[] = [];
  const blockRe = /<li class="b_algo"[\s\S]*?<\/li>/g;
  for (let m; (m = blockRe.exec(html)) && results.length < 12; ) {
    const block = m[0];
    const link = block.match(/<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!link) continue;
    const url = decodeEntities(link[1]);
    if (!/^https?:\/\//.test(url)) continue;
    const cap = block.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    results.push({
      title: stripTags(link[2]),
      url,
      snippet: cap ? stripTags(cap[1]).slice(0, 300) : "",
    });
  }
  return results;
}

/* ---------- 网页正文抓取 ---------- */

const PAGE_CHAR_LIMIT = 8000;

async function fetchPage(url: string) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,*/*" },
      signal: AbortSignal.timeout(20_000),
      redirect: "follow",
    });
    if (!res.ok) return { url, title: "", text: "", error: `HTTP ${res.status}` };
    const ct = res.headers.get("content-type") ?? "";
    if (ct && !/text\/html|text\/plain|application\/xhtml/.test(ct)) {
      return { url, title: "", text: "", error: `不支持的内容类型 ${ct.split(";")[0]}` };
    }
    const html = await res.text();
    const title = stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");

    // 去掉不含正文的区块后取纯文本
    let body = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<(nav|header|footer|aside|form)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ");
    // 保留段落边界，便于模型识别结构
    body = body.replace(/<\/(p|div|li|h[1-6]|tr|br)>/gi, "\n").replace(/<br\s*\/?>/gi, "\n");
    const text = decodeEntities(body.replace(/<[^>]+>/g, " "))
      .split("\n")
      .map((l) => l.replace(/\s+/g, " ").trim())
      .filter((l) => l.length > 1)
      .join("\n")
      .slice(0, PAGE_CHAR_LIMIT);

    return { url, title, text, error: text ? undefined : "未提取到正文" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      url,
      title: "",
      text: "",
      error: msg.includes("abort") || msg.includes("timeout") ? "抓取超时（20s）" : msg,
    };
  }
}

/* ---------- 入口 ---------- */

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();

  let body: { action?: string; query?: string; urls?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  if (body.action === "search") {
    const query = String(body.query ?? "").trim();
    if (!query) return NextResponse.json({ error: "请输入搜索关键词" }, { status: 400 });
    const errors: string[] = [];
    for (const engine of [searchDuckDuckGo, searchBing]) {
      try {
        const results = await engine(query);
        if (results.length) return NextResponse.json({ results });
        errors.push("未解析到结果");
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
    }
    return NextResponse.json(
      { error: `联网搜索失败（请检查服务器外网连通性）：${errors.join("；")}` },
      { status: 502 }
    );
  }

  if (body.action === "fetch") {
    const urls = (Array.isArray(body.urls) ? body.urls : [])
      .filter((u): u is string => typeof u === "string" && /^https?:\/\//.test(u))
      .slice(0, 6); // 一次最多抓 6 篇，控制耗时与 token 量
    if (!urls.length) {
      return NextResponse.json({ error: "请先勾选或添加要抓取的网页" }, { status: 400 });
    }
    const pages = await Promise.all(urls.map(fetchPage));
    return NextResponse.json({ pages });
  }

  return NextResponse.json({ error: "未知操作" }, { status: 400 });
}
