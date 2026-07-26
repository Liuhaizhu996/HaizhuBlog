"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { marked } from "marked";
import type { PostMeta } from "@/lib/posts";
import type { LinkGroup } from "@/lib/links";
import type {
  SiteSettings,
  AiTool,
  AiProvider,
  ModelMapping,
} from "@/lib/store";

/* ================= 类型 ================= */

type PostDraft = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
};

const EMPTY_DRAFT: PostDraft = {
  slug: "",
  title: "",
  date: new Date().toISOString().slice(0, 10),
  category: "资讯",
  excerpt: "",
  content: "",
};

const TABS = [
  { key: "posts", label: "📝 文章发布" },
  { key: "collect", label: "🔎 AI 采集改写" },
  { key: "ai", label: "🤖 AI 模型" },
  { key: "tools", label: "🧰 AI 工具" },
  { key: "links", label: "🧭 站点导航" },
  { key: "bot", label: "💬 客服与联系方式" },
  { key: "security", label: "🔐 修改密码" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* ================= 页面 ================= */

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [defaultPassword, setDefaultPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [tab, setTab] = useState<TabKey>("posts");
  // 「AI 采集」生成的稿件，交给文章编辑器
  const [pendingDraft, setPendingDraft] = useState<PostDraft | null>(null);

  useEffect(() => {
    fetch("/api/admin/login")
      .then((r) => r.json())
      .then((d) => {
        setAuthed(Boolean(d.authed));
        setDefaultPassword(Boolean(d.defaultPassword));
      })
      .catch(() => setAuthed(false));
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) setAuthed(true);
    else setLoginErr((await res.json()).error ?? "登录失败");
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
  }

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-mid">
        加载中…
      </div>
    );
  }

  /* ---------- 登录页 ---------- */
  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <form onSubmit={login} className="card-soft w-full max-w-sm p-8">
          <h1 className="font-display text-3xl">管理后台</h1>
          <p className="mt-2 text-sm text-slate-mid">
            输入管理员密码以继续
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="管理员密码"
            autoFocus
            className="mt-6 w-full rounded-lg border border-hairline px-4 py-2.5 text-sm outline-none focus:border-black"
          />
          {loginErr && (
            <p className="mt-2 text-xs text-red-600">{loginErr}</p>
          )}
          <button type="submit" className="btn-black mt-4 w-full rounded-lg py-2.5 text-sm font-semibold">
            登录
          </button>
          <p className="mt-4 text-xs leading-relaxed text-slate-mid">
            密码通过环境变量 <code className="rounded bg-cloud px-1">ADMIN_PASSWORD</code>{" "}
            设置；未设置时默认为{" "}
            <code className="rounded bg-cloud px-1">haizhuai-admin</code>，请部署后尽快修改。
          </p>
        </form>
      </div>
    );
  }

  /* ---------- 后台主界面 ---------- */
  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">管理后台</h1>
          <p className="mt-1 text-sm text-slate-mid">
            文章发布 · AI 模型 · 站点导航 · 客服配置
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-hairline px-4 py-2 text-sm text-slate-mid transition hover:border-black hover:text-black"
        >
          退出登录
        </button>
      </div>

      {defaultPassword && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-700">
          ⚠️ 当前使用默认密码。请在部署环境中设置 ADMIN_PASSWORD 环境变量后重启服务。
        </p>
      )}

      <div className="mt-8 flex gap-2 overflow-x-auto border-b border-hairline pb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === t.key
                ? "bg-black text-white"
                : "text-slate-mid hover:text-black"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "posts" && (
          <PostsPanel
            incoming={pendingDraft}
            onConsumed={() => setPendingDraft(null)}
          />
        )}
        {tab === "collect" && (
          <CollectPanel
            onExport={(d) => {
              setPendingDraft(d);
              setTab("posts");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}
        {tab === "ai" && <AiPanel />}
        {tab === "tools" && <ToolsPanel />}
        {tab === "links" && <LinksPanel />}
        {tab === "bot" && <BotPanel />}
        {tab === "security" && <SecurityPanel />}
      </div>
    </div>
  );
}

/* ================= 文章管理 ================= */

type UploadedImage = { name: string; url: string; size: number; mtime: number };

/** Markdown 快捷插入按钮 */
const MD_SNIPPETS: Array<{ label: string; title: string; snippet: string }> = [
  { label: "H2", title: "小标题", snippet: "\n## 小标题\n" },
  { label: "B", title: "加粗", snippet: "**加粗文字**" },
  { label: "❝", title: "引用", snippet: "\n> 引用内容\n" },
  { label: "•", title: "列表", snippet: "\n- 要点一\n- 要点二\n" },
  { label: "</>", title: "代码块", snippet: "\n```\n代码\n```\n" },
  { label: "🔗", title: "链接", snippet: "[链接文字](https://)" },
  { label: "―", title: "分隔线", snippet: "\n---\n" },
];

function PostsPanel({
  incoming,
  onConsumed,
}: {
  incoming: PostDraft | null;
  onConsumed: () => void;
}) {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [draft, setDraft] = useState<PostDraft>(EMPTY_DRAFT);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => {
    fetch("/api/admin/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []));
  }, []);

  useEffect(refresh, [refresh]);

  // 接收「AI 采集改写」页导入的稿件
  useEffect(() => {
    if (!incoming) return;
    setDraft(incoming);
    setEditing(false);
    setPreview(false);
    setMsg("✍️ 已载入 AI 采集稿件，检查排版后即可发布");
    onConsumed();
  }, [incoming, onConsumed]);

  const loadImages = useCallback(() => {
    fetch("/api/admin/upload")
      .then((r) => r.json())
      .then((d) => setImages(d.images ?? []));
  }, []);

  useEffect(() => {
    if (galleryOpen) loadImages();
  }, [galleryOpen, loadImages]);

  /** 在光标处插入文本，并保持焦点 */
  function insertAtCursor(snippet: string) {
    const ta = contentRef.current;
    setDraft((d) => {
      const start = ta?.selectionStart ?? d.content.length;
      const end = ta?.selectionEnd ?? start;
      const content = d.content.slice(0, start) + snippet + d.content.slice(end);
      if (ta) {
        requestAnimationFrame(() => {
          ta.focus();
          const pos = start + snippet.length;
          ta.setSelectionRange(pos, pos);
        });
      }
      return { ...d, content };
    });
  }

  /** 上传本地图片并插入 Markdown（按钮 / 粘贴 / 拖拽共用） */
  async function uploadImages(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setUploading(true);
    for (const f of list) {
      const fd = new FormData();
      fd.append("file", f);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const d = await res.json();
        if (res.ok) {
          const alt = f.name.replace(/\.[^.]+$/, "") || "图片";
          insertAtCursor(`\n![${alt}](${d.url})\n`);
          setMsg(`✅ 图片已上传并插入（${d.name}）`);
        } else {
          setMsg(`❌ ${d.error ?? "上传失败"}`);
        }
      } catch {
        setMsg("❌ 上传失败，请检查网络后重试");
      }
    }
    setUploading(false);
    if (galleryOpen) loadImages();
  }

  async function removeImage(name: string) {
    if (!confirm(`删除图片「${name}」？已引用它的文章会显示裂图。`)) return;
    await fetch(`/api/admin/upload?name=${encodeURIComponent(name)}`, {
      method: "DELETE",
    });
    loadImages();
  }

  async function save() {
    setMsg("保存中…");
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const d = await res.json();
    if (res.ok) {
      setMsg(`✅ 已发布（slug: ${d.slug}）`);
      setDraft(EMPTY_DRAFT);
      setEditing(false);
      refresh();
    } else {
      setMsg(`❌ ${d.error}`);
    }
  }

  async function edit(slug: string) {
    const res = await fetch(`/api/admin/posts?slug=${encodeURIComponent(slug)}`);
    const d = await res.json();
    if (d.post) {
      setDraft(d.post);
      setEditing(true);
      setMsg("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function remove(slug: string) {
    if (!confirm(`确定删除文章「${slug}」吗？此操作不可恢复。`)) return;
    await fetch(`/api/admin/posts?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      {/* 编辑器 */}
      <div className="card-soft p-6">
        <h2 className="font-grotesk text-lg font-bold">
          {editing ? `编辑：${draft.slug}` : "发布新文章"}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-mid">
            标题
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-mid">
            Slug（URL 标识，留空自动生成）
            <input
              value={draft.slug}
              disabled={editing}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              onBlur={() => {
                if (!draft.slug && draft.title)
                  setDraft({
                    ...draft,
                    slug: `post-${Date.now().toString(36)}`,
                  });
              }}
              placeholder="my-first-post"
              className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black disabled:bg-cloud"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-mid">
            日期
            <input
              type="date"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-mid">
            分类
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              className="mt-1 w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
            >
              <option>资讯</option>
              <option>教程</option>
              <option>日常</option>
            </select>
          </label>
        </div>
        <label className="mt-3 block text-xs font-semibold text-slate-mid">
          摘要（显示在卡片上）
          <input
            value={draft.excerpt}
            onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
            className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
          />
        </label>
        <div className="mt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-mid">
              正文（Markdown）
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {MD_SNIPPETS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  title={s.title}
                  onClick={() => insertAtCursor(s.snippet)}
                  className="rounded-md border border-hairline px-2 py-1 font-mono text-xs text-slate-mid hover:border-black hover:text-black"
                >
                  {s.label}
                </button>
              ))}
              <span className="mx-1 h-4 w-px bg-hairline" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="rounded-md border border-hairline px-2.5 py-1 text-xs text-slate-mid hover:border-black hover:text-black disabled:opacity-50"
              >
                {uploading ? "上传中…" : "🖼 上传图片"}
              </button>
              <button
                type="button"
                onClick={() => setGalleryOpen((v) => !v)}
                className={`rounded-md border px-2.5 py-1 text-xs ${
                  galleryOpen
                    ? "border-black text-black"
                    : "border-hairline text-slate-mid hover:border-black hover:text-black"
                }`}
              >
                图库
              </button>
              <button
                type="button"
                onClick={() => setPreview((v) => !v)}
                className={`rounded-md border px-2.5 py-1 text-xs ${
                  preview
                    ? "border-black bg-black text-white"
                    : "border-hairline text-slate-mid hover:border-black hover:text-black"
                }`}
              >
                {preview ? "返回编辑" : "预览"}
              </button>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) uploadImages(e.target.files);
              e.target.value = "";
            }}
          />

          {/* 图库：点击图片插入到光标处 */}
          {galleryOpen && (
            <div className="mt-2 rounded-lg border border-hairline bg-cloud/60 p-3">
              {images.length === 0 ? (
                <p className="text-xs text-slate-mid">
                  还没有上传过图片。点「🖼 上传图片」，或直接把图片拖进正文框 / 粘贴截图。
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {images.map((img) => (
                    <div key={img.name} className="group relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.name}
                        title={`点击插入 ${img.name}`}
                        onClick={() =>
                          insertAtCursor(`\n![${img.name.replace(/\.[^.]+$/, "")}](${img.url})\n`)
                        }
                        className="h-20 w-full cursor-pointer rounded-lg border border-hairline object-cover transition hover:border-black"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(img.name)}
                        title="删除图片"
                        className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[10px] text-white group-hover:flex"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {preview ? (
            <div
              className="prose-haizhu mt-2 min-h-[336px] rounded-lg border border-hairline px-4 py-3 text-sm"
              dangerouslySetInnerHTML={{
                __html: (marked.parse(draft.content || "*（暂无内容）*") as string) ?? "",
              }}
            />
          ) : (
            <textarea
              ref={contentRef}
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              rows={14}
              onPaste={(e) => {
                const files = Array.from(e.clipboardData?.files ?? []);
                if (files.some((f) => f.type.startsWith("image/"))) {
                  e.preventDefault();
                  uploadImages(files);
                }
              }}
              onDrop={(e) => {
                if (e.dataTransfer?.files?.length) {
                  e.preventDefault();
                  uploadImages(e.dataTransfer.files);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              placeholder={
                "支持完整 Markdown 语法。\n\n本地图片：点上方「🖼 上传图片」，或直接把图片拖进来 / 粘贴截图，自动上传并插入。\n网络图片：![说明](https://图片地址)\n插入视频：<video src=\"https://视频地址\" controls style=\"max-width:100%\"></video>\n嵌入B站等：<iframe src=\"...\" ...></iframe>"
              }
              className="mt-2 w-full rounded-lg border border-hairline px-3 py-2 font-mono text-sm font-normal leading-relaxed text-black outline-none focus:border-black"
            />
          )}
          <p className="mt-1 text-[11px] text-slate-mid">
            💡 图片可直接拖拽 / 粘贴到正文框，自动上传到服务器并插入 Markdown；「图库」可复用已上传的图片。
          </p>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={save} className="btn-black rounded-lg px-6 py-2.5 text-sm font-semibold">
            {editing ? "保存修改" : "发布文章"}
          </button>
          {editing && (
            <button
              onClick={() => {
                setDraft(EMPTY_DRAFT);
                setEditing(false);
              }}
              className="rounded-lg border border-hairline px-4 py-2.5 text-sm text-slate-mid hover:border-black hover:text-black"
            >
              取消编辑
            </button>
          )}
          {msg && <span className="text-xs text-slate-mid">{msg}</span>}
        </div>
      </div>

      {/* 文章列表 */}
      <div className="card-soft p-6">
        <h2 className="font-grotesk text-lg font-bold">已发布（{posts.length}）</h2>
        <ul className="mt-4 space-y-2.5">
          {posts.map((p) => (
            <li
              key={p.slug}
              className="flex items-center justify-between gap-3 rounded-lg border border-hairline px-3.5 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{p.title}</p>
                <p className="mt-0.5 text-xs text-slate-mid">
                  {p.category} · {p.date} · {p.slug}
                </p>
              </div>
              <div className="flex shrink-0 gap-2 text-xs">
                <button
                  onClick={() => edit(p.slug)}
                  className="rounded-md border border-hairline px-2.5 py-1 text-slate-mid hover:border-black hover:text-black"
                >
                  编辑
                </button>
                <button
                  onClick={() => remove(p.slug)}
                  className="rounded-md border border-red-200 px-2.5 py-1 text-red-500 hover:border-red-500"
                >
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ================= 修改密码 ================= */

function SecurityPanel() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");

  async function change(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      setMsg("❌ 两次输入的新密码不一致");
      return;
    }
    setMsg("提交中…");
    const res = await fetch("/api/admin/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current, next }),
    });
    const d = await res.json();
    if (res.ok) {
      setMsg("✅ 密码已修改，本会话保持登录，其他设备需重新登录");
      setCurrent("");
      setNext("");
      setConfirm("");
    } else {
      setMsg(`❌ ${d.error}`);
    }
  }

  return (
    <form onSubmit={change} className="card-soft max-w-md p-6">
      <h2 className="font-grotesk text-lg font-bold">修改管理员密码</h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-mid">
        新密码以哈希形式保存在服务器 data/auth.json，优先级高于
        ADMIN_PASSWORD 环境变量；修改后其他已登录设备立即失效。
      </p>
      <label className="mt-5 block text-xs font-semibold text-slate-mid">
        当前密码
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-hairline px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-black"
        />
      </label>
      <label className="mt-3 block text-xs font-semibold text-slate-mid">
        新密码（至少 6 位）
        <input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          minLength={6}
          required
          className="mt-1 w-full rounded-lg border border-hairline px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-black"
        />
      </label>
      <label className="mt-3 block text-xs font-semibold text-slate-mid">
        确认新密码
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          minLength={6}
          required
          className="mt-1 w-full rounded-lg border border-hairline px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-black"
        />
      </label>
      <div className="mt-5 flex items-center gap-3">
        <button type="submit" className="btn-black rounded-lg px-6 py-2.5 text-sm font-semibold">
          修改密码
        </button>
        {msg && <span className="text-xs text-slate-mid">{msg}</span>}
      </div>
    </form>
  );
}

/* ================= AI 模型配置（多渠道 + 模型映射） ================= */

function AiPanel() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [msg, setMsg] = useState("");
  const [fetchMsgs, setFetchMsgs] = useState<Record<string, string>>({});
  const [fetched, setFetched] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings));
  }, []);

  function setAi(patch: Partial<SiteSettings["ai"]>) {
    setSettings((s) => (s ? { ...s, ai: { ...s.ai, ...patch } } : s));
  }

  function updateProvider(i: number, patch: Partial<AiProvider>) {
    if (!settings) return;
    setAi({
      providers: settings.ai.providers.map((p, j) =>
        j === i ? { ...p, ...patch } : p
      ),
    });
  }

  function updateMapping(i: number, patch: Partial<ModelMapping>) {
    if (!settings) return;
    setAi({
      models: settings.ai.models.map((m, j) =>
        j === i ? { ...m, ...patch } : m
      ),
    });
  }

  /** 拉取某个渠道的可用模型 */
  async function fetchModels(p: AiProvider) {
    setFetchMsgs((s) => ({ ...s, [p.id]: "正在获取…" }));
    let res: Response;
    try {
      res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: { provider: p.provider, baseUrl: p.baseUrl, apiKey: p.apiKey },
        }),
      });
    } catch {
      setFetchMsgs((s) => ({ ...s, [p.id]: "无法连接站点后端" }));
      return;
    }
    let d: { error?: string; models?: string[] };
    try {
      d = await res.json();
    } catch {
      setFetchMsgs((s) => ({ ...s, [p.id]: `站点后端返回异常（HTTP ${res.status}）` }));
      return;
    }
    if (d.error) {
      setFetchMsgs((s) => ({ ...s, [p.id]: d.error! }));
    } else if (Array.isArray(d.models) && d.models.length) {
      setFetched((s) => ({ ...s, [p.id]: d.models! }));
      setFetchMsgs((s) => ({
        ...s,
        [p.id]: `获取到 ${d.models!.length} 个模型，可点「导入全部」生成映射`,
      }));
    } else {
      setFetchMsgs((s) => ({ ...s, [p.id]: "服务未返回模型" }));
    }
  }

  /** 把某渠道获取到的模型批量导入映射表（别名=实际模型名，跳过已存在的别名） */
  function importModels(p: AiProvider) {
    if (!settings) return;
    const existing = new Set(settings.ai.models.map((m) => m.alias));
    const added = (fetched[p.id] ?? [])
      .filter((m) => !existing.has(m))
      .map((m) => ({ alias: m, providerId: p.id, target: m }));
    setAi({ models: [...settings.ai.models, ...added] });
    setFetchMsgs((s) => ({ ...s, [p.id]: `已导入 ${added.length} 条映射，记得保存` }));
  }

  async function save() {
    if (!settings) return;
    setMsg("保存中…");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    const d = await res.json();
    if (res.ok) {
      setSettings(d.settings);
      setMsg("✅ 已保存，对话页立即生效");
    } else {
      setMsg(`❌ ${d.error ?? "保存失败"}`);
    }
  }

  if (!settings) return <p className="text-sm text-slate-mid">加载中…</p>;

  const providers = settings.ai.providers;
  const mappings = settings.ai.models;

  return (
    <div className="max-w-4xl space-y-8">
      {/* ---------- API 服务列表 ---------- */}
      <div className="card-soft p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-grotesk text-lg font-bold">API 服务</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-mid">
              可添加多个服务（OpenAI 兼容 / Ollama）。密钥只保存在服务器
              data/ 目录，不会下发给浏览器。
            </p>
          </div>
          <button
            onClick={() =>
              setAi({
                providers: [
                  ...providers,
                  {
                    id: `p-${Date.now().toString(36)}`,
                    name: `服务 ${providers.length + 1}`,
                    provider: "openai",
                    baseUrl: "",
                    apiKey: "",
                  },
                ],
              })
            }
            className="rounded-lg border border-hairline px-4 py-2 text-sm text-slate-mid hover:border-black hover:text-black"
          >
            + 添加 API
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {providers.length === 0 && (
            <p className="rounded-lg bg-cloud px-4 py-3 text-xs text-slate-mid">
              还没有 API 服务。点右上角「+ 添加 API」，未配置时前台为演示模式。
            </p>
          )}
          {providers.map((p, i) => (
            <div key={p.id} className="rounded-xl border border-hairline p-4">
              <div className="grid gap-3 md:grid-cols-[1fr_1.4fr]">
                <input
                  value={p.name}
                  placeholder="服务名称（如 DeepSeek 官方）"
                  onChange={(e) => updateProvider(i, { name: e.target.value })}
                  className="rounded-lg border border-hairline px-3 py-2 text-sm font-bold outline-none focus:border-black"
                />
                <select
                  value={p.provider}
                  onChange={(e) =>
                    updateProvider(i, {
                      provider: e.target.value as "openai" | "ollama",
                    })
                  }
                  className="rounded-lg border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-black"
                >
                  <option value="openai">
                    OpenAI 兼容（DeepSeek / 通义 / 硅基流动 / OneAPI…）
                  </option>
                  <option value="ollama">Ollama</option>
                </select>
                <input
                  value={p.baseUrl}
                  placeholder="服务地址，如 https://api.deepseek.com"
                  onChange={(e) => updateProvider(i, { baseUrl: e.target.value })}
                  className="rounded-lg border border-hairline px-3 py-2 text-sm outline-none focus:border-black"
                />
                <input
                  type="password"
                  value={p.apiKey}
                  placeholder="API Key（Ollama 可留空）"
                  onChange={(e) => updateProvider(i, { apiKey: e.target.value })}
                  className="rounded-lg border border-hairline px-3 py-2 text-sm outline-none focus:border-black"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => fetchModels(p)}
                  className="btn-black rounded-lg px-3 py-1.5 text-xs font-medium"
                >
                  获取模型
                </button>
                {fetched[p.id]?.length ? (
                  <button
                    onClick={() => importModels(p)}
                    className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-slate-mid hover:border-black hover:text-black"
                  >
                    导入全部（{fetched[p.id].length}）
                  </button>
                ) : null}
                <button
                  onClick={() =>
                    setAi({
                      providers: providers.filter((_, j) => j !== i),
                      models: mappings.map((m) =>
                        m.providerId === p.id ? { ...m, providerId: "" } : m
                      ),
                    })
                  }
                  className="ml-auto rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-500 hover:border-red-500"
                >
                  删除服务
                </button>
              </div>
              {fetchMsgs[p.id] && (
                <p className="mt-2 whitespace-pre-line break-all text-xs text-slate-mid">
                  {fetchMsgs[p.id]}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ---------- 模型映射 ---------- */}
      <div className="card-soft p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-grotesk text-lg font-bold">模型映射</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-mid">
              前台模型名 → 实际调用的服务与模型。通常两者保持一致（「导入全部」即按真实
              模型名生成）；映射的意义在于同名模型可指定走哪个服务。渠道地址与密钥不会暴露给前台。
            </p>
          </div>
          <button
            onClick={() =>
              setAi({
                models: [
                  ...mappings,
                  { alias: "", providerId: providers[0]?.id ?? "", target: "" },
                ],
              })
            }
            className="rounded-lg border border-hairline px-4 py-2 text-sm text-slate-mid hover:border-black hover:text-black"
          >
            + 添加映射
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {mappings.length === 0 && (
            <p className="rounded-lg bg-cloud px-4 py-3 text-xs text-slate-mid">
              还没有模型映射，前台将无模型可选。
            </p>
          )}
          {mappings.map((m, i) => (
            <div
              key={i}
              className="grid items-center gap-2 md:grid-cols-[1.2fr_auto_1.2fr_1.2fr_auto]"
            >
              <input
                value={m.alias}
                placeholder="前台模型名，如 deepseek-chat"
                onChange={(e) => updateMapping(i, { alias: e.target.value })}
                className="rounded-lg border border-hairline px-3 py-2 text-sm outline-none focus:border-black"
              />
              <span className="hidden text-center text-black/30 md:block">→</span>
              <select
                value={m.providerId}
                onChange={(e) => updateMapping(i, { providerId: e.target.value })}
                className="rounded-lg border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-black"
              >
                <option value="">（未指定服务）</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                value={m.target}
                placeholder="实际模型名，如 deepseek-chat"
                list={`models-${m.providerId}`}
                onChange={(e) => updateMapping(i, { target: e.target.value })}
                className="rounded-lg border border-hairline px-3 py-2 text-sm outline-none focus:border-black"
              />
              <button
                onClick={() =>
                  setAi({ models: mappings.filter((_, j) => j !== i) })
                }
                className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-500 hover:border-red-500"
              >
                删
              </button>
            </div>
          ))}
        </div>

        {/* 为每个渠道提供已获取模型的输入建议 */}
        {Object.entries(fetched).map(([pid, list]) => (
          <datalist key={pid} id={`models-${pid}`}>
            {list.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        ))}

        <div className="mt-5 flex items-center gap-3">
          <button onClick={save} className="btn-black rounded-lg px-6 py-2.5 text-sm font-semibold">
            保存全部配置
          </button>
          {msg && <span className="text-xs text-slate-mid">{msg}</span>}
        </div>
      </div>
    </div>
  );
}

/* ================= AI 工具管理 ================= */

function ToolsPanel() {
  const [tools, setTools] = useState<AiTool[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/tools")
      .then((r) => r.json())
      .then((d) => setTools(d.tools ?? []));
  }, []);

  function update(i: number, patch: Partial<AiTool>) {
    setTools((ts) => ts.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  }

  async function save() {
    setMsg("保存中…");
    const res = await fetch("/api/admin/tools", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tools }),
    });
    const d = await res.json();
    if (res.ok) {
      setTools(d.tools);
      setMsg("✅ 已保存，工具页与首页立即生效");
    } else {
      setMsg(`❌ ${d.error}`);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-mid">
          管理「AI 工具广场」的卡片与跳转地址。🔒 标记为本站内置功能，
          跳转地址固定不可修改；其余工具可自由配置外链（https://…）。
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setTools([
                ...tools,
                { name: "", desc: "", status: "规划中", live: false, url: "", locked: false },
              ])
            }
            className="rounded-lg border border-hairline px-4 py-2 text-sm text-slate-mid hover:border-black hover:text-black"
          >
            + 添加工具
          </button>
          <button onClick={save} className="btn-black rounded-lg px-6 py-2 text-sm font-semibold">
            保存全部
          </button>
          {msg && <span className="text-xs text-slate-mid">{msg}</span>}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {tools.map((t, i) => (
          <div key={i} className="card-soft p-5">
            <div className="grid gap-3 md:grid-cols-[1.2fr_2fr]">
              <div className="space-y-3">
                <input
                  value={t.name}
                  placeholder="工具名称"
                  onChange={(e) => update(i, { name: e.target.value })}
                  className="w-full rounded-lg border border-hairline px-3 py-2 text-sm font-bold outline-none focus:border-black"
                />
                <div className="flex items-center gap-3">
                  <input
                    value={t.status}
                    placeholder="状态徽章文字"
                    onChange={(e) => update(i, { status: e.target.value })}
                    className="w-28 rounded-lg border border-hairline px-3 py-2 text-sm outline-none focus:border-black"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-slate-mid">
                    <input
                      type="checkbox"
                      checked={t.live}
                      onChange={(e) => update(i, { live: e.target.checked })}
                    />
                    绿色徽章（已上线）
                  </label>
                </div>
              </div>
              <div className="space-y-3">
                <input
                  value={t.desc}
                  placeholder="一句话描述"
                  onChange={(e) => update(i, { desc: e.target.value })}
                  className="w-full rounded-lg border border-hairline px-3 py-2 text-sm outline-none focus:border-black"
                />
                <div className="flex items-center gap-2">
                  <input
                    value={t.url}
                    disabled={t.locked}
                    placeholder="https://…（留空则卡片不可点击）"
                    onChange={(e) => update(i, { url: e.target.value })}
                    className="w-full rounded-lg border border-hairline px-3 py-2 text-sm outline-none focus:border-black disabled:bg-cloud disabled:text-black/50"
                  />
                  {t.locked ? (
                    <span
                      title="本站内置功能，跳转地址不可修改"
                      className="shrink-0 rounded-md bg-cloud px-2.5 py-2 text-xs text-slate-mid"
                    >
                      🔒 本站
                    </span>
                  ) : (
                    <button
                      onClick={() => setTools(tools.filter((_, j) => j !== i))}
                      className="shrink-0 rounded-md border border-red-200 px-2.5 py-2 text-xs text-red-500 hover:border-red-500"
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= 站点导航管理 ================= */

function LinksPanel() {
  const [groups, setGroups] = useState<LinkGroup[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/links")
      .then((r) => r.json())
      .then((d) => setGroups(d.groups ?? []));
  }, []);

  function update(gi: number, patch: Partial<LinkGroup>) {
    setGroups((gs) => gs.map((g, i) => (i === gi ? { ...g, ...patch } : g)));
  }

  function updateLink(gi: number, li: number, field: "name" | "desc" | "url", value: string) {
    setGroups((gs) =>
      gs.map((g, i) =>
        i === gi
          ? {
              ...g,
              links: g.links.map((l, j) => (j === li ? { ...l, [field]: value } : l)),
            }
          : g
      )
    );
  }

  async function save() {
    setMsg("保存中…");
    const res = await fetch("/api/admin/links", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groups }),
    });
    const d = await res.json();
    if (res.ok) {
      setGroups(d.groups);
      setMsg("✅ 已保存，导航页立即生效");
    } else {
      setMsg(`❌ ${d.error}`);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-mid">
          分组式管理（参考 Navlink 的组织方式）。链接需以 http(s):// 开头；保存时自动过滤无效项。
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGroups([...groups, { title: "新分组", links: [] }])}
            className="rounded-lg border border-hairline px-4 py-2 text-sm text-slate-mid hover:border-black hover:text-black"
          >
            + 添加分组
          </button>
          <button onClick={save} className="btn-black rounded-lg px-6 py-2 text-sm font-semibold">
            保存全部
          </button>
          {msg && <span className="text-xs text-slate-mid">{msg}</span>}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {groups.map((g, gi) => (
          <div key={gi} className="card-soft p-5">
            <div className="flex items-center gap-3">
              <input
                value={g.title}
                onChange={(e) => update(gi, { title: e.target.value })}
                className="rounded-lg border border-hairline px-3 py-1.5 text-sm font-bold outline-none focus:border-black"
              />
              <button
                onClick={() =>
                  update(gi, { links: [...g.links, { name: "", desc: "", url: "" }] })
                }
                className="rounded-md border border-hairline px-2.5 py-1 text-xs text-slate-mid hover:border-black hover:text-black"
              >
                + 链接
              </button>
              <button
                onClick={() => setGroups(groups.filter((_, i) => i !== gi))}
                className="ml-auto rounded-md border border-red-200 px-2.5 py-1 text-xs text-red-500 hover:border-red-500"
              >
                删除分组
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {g.links.map((l, li) => (
                <div key={li} className="grid gap-2 md:grid-cols-[1fr_1.4fr_1.6fr_auto]">
                  <input
                    value={l.name}
                    placeholder="名称"
                    onChange={(e) => updateLink(gi, li, "name", e.target.value)}
                    className="rounded-lg border border-hairline px-3 py-1.5 text-sm outline-none focus:border-black"
                  />
                  <input
                    value={l.desc}
                    placeholder="一句话描述"
                    onChange={(e) => updateLink(gi, li, "desc", e.target.value)}
                    className="rounded-lg border border-hairline px-3 py-1.5 text-sm outline-none focus:border-black"
                  />
                  <input
                    value={l.url}
                    placeholder="https://…"
                    onChange={(e) => updateLink(gi, li, "url", e.target.value)}
                    className="rounded-lg border border-hairline px-3 py-1.5 text-sm outline-none focus:border-black"
                  />
                  <button
                    onClick={() =>
                      update(gi, { links: g.links.filter((_, j) => j !== li) })
                    }
                    className="rounded-md border border-red-200 px-2.5 text-xs text-red-500 hover:border-red-500"
                  >
                    删
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= 客服机器人 + 联系方式 ================= */

function BotPanel() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings));
  }, []);

  async function save() {
    if (!settings) return;
    setMsg("保存中…");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    setMsg(res.ok ? "✅ 已保存" : "❌ 保存失败");
  }

  if (!settings) return <p className="text-sm text-slate-mid">加载中…</p>;

  const c = settings.contacts;

  return (
    <div className="grid max-w-4xl gap-8 md:grid-cols-2">
      <div className="card-soft p-6">
        <h2 className="font-grotesk text-lg font-bold">TG 双向客服机器人（右下角浮窗）</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-mid">
          已内置{" "}
          <a
            href={settings.tgbot.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Customer-service-bot
          </a>{" "}
          的双向对话机制，无需单独部署：访客在浮窗发消息 → 转发到你的
          Telegram → 你对那条消息「引用回复」→ 自动送回访客网页。
          配置步骤：① 在 @BotFather 创建机器人拿到 Token；② 给机器人发一条
          /start；③ 用 @userinfobot 查到自己的数字 ID 填到下方。
        </p>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.tgbot.enabled}
            onChange={(e) =>
              setSettings({
                ...settings,
                tgbot: { ...settings.tgbot, enabled: e.target.checked },
              })
            }
          />
          启用右下角客服浮窗
        </label>
        <label className="mt-4 block text-xs font-semibold text-slate-mid">
          Bot Token（仅存服务器，不下发给浏览器）
          <input
            type="password"
            value={settings.tgbot.botToken}
            onChange={(e) =>
              setSettings({
                ...settings,
                tgbot: { ...settings.tgbot, botToken: e.target.value },
              })
            }
            placeholder="123456789:AAxxxxxxxx…"
            className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
          />
        </label>
        <label className="mt-3 block text-xs font-semibold text-slate-mid">
          管理员 Telegram 数字 ID（接收访客消息）
          <input
            value={settings.tgbot.adminId}
            onChange={(e) =>
              setSettings({
                ...settings,
                tgbot: { ...settings.tgbot, adminId: e.target.value },
              })
            }
            placeholder="例如 5123456789"
            className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
          />
        </label>
        <label className="mt-3 block text-xs font-semibold text-slate-mid">
          机器人用户名（可选，不带 @；未配置 Token 时浮窗退化为跳转 t.me 链接）
          <input
            value={settings.tgbot.botUsername}
            onChange={(e) =>
              setSettings({
                ...settings,
                tgbot: { ...settings.tgbot, botUsername: e.target.value },
              })
            }
            className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
          />
        </label>
        <label className="mt-3 block text-xs font-semibold text-slate-mid">
          欢迎语
          <textarea
            value={settings.tgbot.greeting}
            rows={3}
            onChange={(e) =>
              setSettings({
                ...settings,
                tgbot: { ...settings.tgbot, greeting: e.target.value },
              })
            }
            className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
          />
        </label>
      </div>

      <div className="card-soft p-6">
        <h2 className="font-grotesk text-lg font-bold">联系方式（关于页 + 浮窗展示）</h2>
        <div className="mt-4 grid gap-3">
          {(
            [
              ["wechat", "WeChat"],
              ["qq", "QQ"],
              ["blog", "Blog"],
              ["telegram", "Telegram"],
              ["whatsapp", "WhatsApp"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-xs font-semibold text-slate-mid">
              {label}
              <input
                value={c[key]}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contacts: { ...c, [key]: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
              />
            </label>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button onClick={save} className="btn-black rounded-lg px-6 py-2.5 text-sm font-semibold">
            保存
          </button>
          {msg && <span className="text-xs text-slate-mid">{msg}</span>}
        </div>
      </div>
    </div>
  );
}

/* ================= AI 采集改写（联网搜索 → 抓取正文 → LLM 改写为 Markdown） ================= */

type CollectResult = { title: string; url: string; snippet: string; checked: boolean };
type FetchedPage = { url: string; title: string; text: string; error?: string };

const SEARCH_PRESETS = [
  "AI 行业 最新新闻",
  "大模型 发布 动态",
  "开源项目 本周热门",
  "科技论坛 热门讨论",
];

function CollectPanel({ onExport }: { onExport: (d: PostDraft) => void }) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<CollectResult[]>([]);
  const [manualUrl, setManualUrl] = useState("");
  const [pages, setPages] = useState<FetchedPage[]>([]);
  const [fetching, setFetching] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [aiConfigured, setAiConfigured] = useState(true);
  const [model, setModel] = useState("");
  const [instruction, setInstruction] = useState("");
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState("");
  const [err, setErr] = useState("");
  const outputRef = useRef<HTMLTextAreaElement>(null);

  // 模型列表复用「AI 模型」页配置的渠道与映射（即前台对话用的同一套 API）
  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((d) => {
        const list: string[] = d.serverAi?.models ?? [];
        setModels(list);
        setModel(list[0] ?? "");
        setAiConfigured(Boolean(d.serverAi?.configured));
      })
      .catch(() => setAiConfigured(false));
  }, []);

  async function search(q?: string) {
    const kw = (q ?? query).trim();
    if (!kw) return;
    setQuery(kw);
    setSearching(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search", query: kw }),
      });
      const d = await res.json();
      if (!res.ok) {
        setErr(d.error ?? "搜索失败");
      } else {
        // 默认勾选前 3 条，管理员可自行调整
        setResults(
          (d.results as Omit<CollectResult, "checked">[]).map((r, i) => ({
            ...r,
            checked: i < 3,
          }))
        );
        setPages([]);
      }
    } catch {
      setErr("无法连接站点后端");
    }
    setSearching(false);
  }

  function addManual() {
    const url = manualUrl.trim();
    if (!/^https?:\/\//.test(url)) {
      setErr("请输入以 http(s):// 开头的完整网址");
      return;
    }
    setErr("");
    setResults((rs) => [
      { title: url, url, snippet: "（手动添加）", checked: true },
      ...rs.filter((r) => r.url !== url),
    ]);
    setManualUrl("");
  }

  async function fetchPages() {
    const urls = results.filter((r) => r.checked).map((r) => r.url);
    if (!urls.length) {
      setErr("请先勾选要抓取的网页（最多 6 个）");
      return;
    }
    setFetching(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fetch", urls }),
      });
      const d = await res.json();
      if (!res.ok) setErr(d.error ?? "抓取失败");
      else setPages(d.pages ?? []);
    } catch {
      setErr("无法连接站点后端");
    }
    setFetching(false);
  }

  /** 调用站内 /api/chat（与前台对话同一套渠道配置）流式生成 Markdown 稿件 */
  async function generate() {
    const usable = pages.filter((p) => p.text);
    if (!usable.length) {
      setErr("请先完成第 ② 步抓取，至少要有一篇成功提取正文的网页");
      return;
    }
    setGenerating(true);
    setErr("");
    setOutput("");

    const material = usable
      .map(
        (p, i) =>
          `【素材 ${i + 1}】${p.title || "无标题"}\n来源：${p.url}\n${p.text}`
      )
      .join("\n\n----------------\n\n");

    const messages = [
      {
        role: "system",
        content:
          "你是一位资深中文科技编辑，擅长把多篇新闻/论坛素材整合改写成一篇排版优美的 Markdown 博客文章。",
      },
      {
        role: "user",
        content: `请基于以下素材，整合改写成一篇原创中文博客文章。

要求：
1. 只依据素材内容写作，不得编造事实；观点冲突时注明不同来源的说法。
2. 排版优美：使用 ## 小标题分节、要点用列表、关键结论可用 > 引用块，适当加粗关键词；如有数据对比可用 Markdown 表格。
3. 文末加「## 参考来源」小节，列出素材链接。
4. 语言流畅自然，面向普通科技读者，全文 800–1500 字。
${instruction.trim() ? `5. 额外要求：${instruction.trim()}` : ""}

严格按以下格式输出（前三行是元信息，之后单独一行 --- 分隔，再输出正文 Markdown）：
TITLE: <文章标题>
EXCERPT: <一句话摘要，60 字以内>
CATEGORY: <资讯|教程|日常 中选一个>
---
<正文 Markdown>

素材如下：

${material}`,
      },
    ];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages }),
      });
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        const d = await res.json();
        if (d.demo) {
          setErr("站点尚未接入真实模型服务：请先到「🤖 AI 模型」页添加 API 渠道并保存");
        } else {
          setErr(d.error ?? "生成失败");
        }
      } else if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setOutput(acc);
          outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
        }
      }
    } catch {
      setErr("生成中断，请重试");
    }
    setGenerating(false);
  }

  /** 解析 TITLE/EXCERPT/CATEGORY 头，填入文章编辑器 */
  function exportDraft() {
    const lines = output.split("\n");
    const sep = lines.findIndex((l) => l.trim() === "---");
    const head = (sep === -1 ? [] : lines.slice(0, sep)).join("\n");
    const body = (sep === -1 ? output : lines.slice(sep + 1).join("\n")).trim();
    const title = head.match(/TITLE[:：]\s*(.+)/)?.[1]?.trim();
    const excerpt = head.match(/EXCERPT[:：]\s*(.+)/)?.[1]?.trim();
    const category = head.match(/CATEGORY[:：]\s*(资讯|教程|日常)/)?.[1];
    onExport({
      slug: "",
      title: title || query || "AI 采集稿件",
      date: new Date().toISOString().slice(0, 10),
      category: category ?? "资讯",
      excerpt: excerpt ?? "",
      content: body,
    });
  }

  const checkedCount = results.filter((r) => r.checked).length;

  return (
    <div className="max-w-4xl space-y-6">
      <p className="text-sm leading-relaxed text-slate-mid">
        三步生成文章：① 联网搜索新闻 / 论坛（或直接粘贴网址）→ ② 抓取网页正文 →
        ③ 用站内配置的大模型一键改写成排版优美的 Markdown，并填入文章编辑器。
        改写使用「🤖 AI 模型」页配置的同一套 API 渠道。
      </p>

      {!aiConfigured && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-700">
          ⚠️ 尚未配置任何 AI 服务，第 ③ 步无法使用。请先到「🤖 AI 模型」页添加 API 渠道。
        </p>
      )}

      {/* ① 联网搜索 */}
      <div className="card-soft p-6">
        <h2 className="font-grotesk text-lg font-bold">① 联网搜索素材</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="输入关键词，如：AI 芯片 最新进展"
            className="w-full rounded-lg border border-hairline px-3 py-2.5 text-sm outline-none focus:border-black"
          />
          <button
            onClick={() => search()}
            disabled={searching}
            className="btn-black shrink-0 rounded-lg px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {searching ? "搜索中…" : "🔍 联网搜索"}
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SEARCH_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => search(p)}
              className="rounded-full border border-hairline px-3 py-1 text-xs text-slate-mid hover:border-black hover:text-black"
            >
              {p}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addManual()}
            placeholder="也可以直接粘贴文章 / 帖子网址（https://…）"
            className="w-full rounded-lg border border-hairline px-3 py-2 text-xs outline-none focus:border-black"
          />
          <button
            onClick={addManual}
            className="shrink-0 rounded-lg border border-hairline px-4 py-2 text-xs text-slate-mid hover:border-black hover:text-black"
          >
            + 添加网址
          </button>
        </div>

        {results.length > 0 && (
          <ul className="mt-4 space-y-2">
            {results.map((r, i) => (
              <li
                key={r.url}
                className={`flex items-start gap-3 rounded-lg border px-3.5 py-2.5 transition ${
                  r.checked ? "border-black/60 bg-cloud/60" : "border-hairline"
                }`}
              >
                <input
                  type="checkbox"
                  checked={r.checked}
                  onChange={(e) =>
                    setResults((rs) =>
                      rs.map((x, j) => (j === i ? { ...x, checked: e.target.checked } : x))
                    )
                  }
                  className="mt-1"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{r.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-mid">{r.snippet}</p>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 block truncate text-[11px] text-slate-mid underline"
                  >
                    {r.url}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ② 抓取正文 */}
      <div className="card-soft p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-grotesk text-lg font-bold">② 抓取网页正文</h2>
          <button
            onClick={fetchPages}
            disabled={fetching || !checkedCount}
            className="btn-black rounded-lg px-6 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {fetching ? "抓取中…" : `抓取已选 ${checkedCount} 个网页`}
          </button>
        </div>
        {pages.length > 0 && (
          <ul className="mt-4 space-y-2">
            {pages.map((p) => (
              <li
                key={p.url}
                className="flex items-center justify-between gap-3 rounded-lg border border-hairline px-3.5 py-2.5 text-sm"
              >
                <span className="min-w-0 truncate">{p.title || p.url}</span>
                {p.error ? (
                  <span className="shrink-0 text-xs text-red-500">❌ {p.error}</span>
                ) : (
                  <span className="shrink-0 text-xs text-green-600">
                    ✅ 已提取 {p.text.length} 字
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ③ AI 改写 */}
      <div className="card-soft p-6">
        <h2 className="font-grotesk text-lg font-bold">③ AI 一键改写为 Markdown</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-mid">
            使用模型（来自「AI 模型」页的映射）
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
            >
              {models.length === 0 && <option value="">（暂无可用模型）</option>}
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-mid">
            额外写作要求（可选）
            <input
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="如：偏向教程口吻 / 重点分析对开发者的影响"
              className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={generate}
            disabled={generating || !pages.some((p) => p.text)}
            className="btn-black rounded-lg px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {generating ? "✨ 生成中…" : "✨ 开始改写"}
          </button>
          {output && !generating && (
            <button
              onClick={exportDraft}
              className="btn-lime rounded-lg px-6 py-2.5 text-sm font-semibold"
            >
              📝 一键填入文章编辑器
            </button>
          )}
        </div>
        {err && (
          <p className="mt-3 whitespace-pre-line break-all rounded-lg bg-red-50 px-4 py-3 text-xs text-red-600">
            {err}
          </p>
        )}
        {output && (
          <textarea
            ref={outputRef}
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            rows={16}
            className="mt-4 w-full rounded-lg border border-hairline bg-cloud/40 px-3 py-2 font-mono text-xs leading-relaxed outline-none focus:border-black"
          />
        )}
      </div>
    </div>
  );
}
