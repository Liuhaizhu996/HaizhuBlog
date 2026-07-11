"use client";

import { useCallback, useEffect, useState } from "react";
import type { PostMeta } from "@/lib/posts";
import type { LinkGroup } from "@/lib/links";
import type {
  SiteSettings,
  AiTool,
  AiProvider,
  ModelMapping,
} from "@/lib/store";
import type { AiNewsConfig, NewsDraft, NewsRunLog } from "@/lib/ai-news";

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
  { key: "news", label: "📰 AI 资讯" },
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

      <div className="mt-8 flex flex-wrap gap-2 border-b border-hairline pb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
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
        {tab === "posts" && <PostsPanel />}
        {tab === "news" && <NewsPanel />}
        {tab === "ai" && <AiPanel />}
        {tab === "tools" && <ToolsPanel />}
        {tab === "links" && <LinksPanel />}
        {tab === "bot" && <BotPanel />}
        {tab === "security" && <SecurityPanel />}
      </div>
    </div>
  );
}

/* ================= AI 资讯自动化 ================= */

type NewsPayload = {
  config: AiNewsConfig;
  drafts: NewsDraft[];
  models: string[];
  state: {
    lastRunAt: string;
    lastSuccessAt: string;
    seenCount: number;
    runs: NewsRunLog[];
  };
};

function NewsPanel() {
  const [data, setData] = useState<NewsPayload | null>(null);
  const [msg, setMsg] = useState("");
  const [running, setRunning] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/ai-news", { cache: "no-store" });
    if (res.ok) setData(await res.json());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function setConfig(patch: Partial<AiNewsConfig>) {
    setData((current) =>
      current ? { ...current, config: { ...current.config, ...patch } } : current
    );
  }

  function updateSource(index: number, patch: Partial<AiNewsConfig["sources"][number]>) {
    if (!data) return;
    setConfig({
      sources: data.config.sources.map((source, i) =>
        i === index ? { ...source, ...patch } : source
      ),
    });
  }

  async function persistConfig(showSuccess = true) {
    if (!data) return false;
    if (showSuccess) setMsg("保存中…");
    const res = await fetch("/api/admin/ai-news", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: data.config }),
    });
    const body = await res.json();
    if (!res.ok) {
      setMsg(`❌ ${body.error ?? "保存失败"}`);
      return false;
    }
    setData((current) => (current ? { ...current, config: body.config } : current));
    if (showSuccess) setMsg("✅ 配置已保存，调度器将按新设置运行");
    return true;
  }

  async function runNow() {
    if (!(await persistConfig(false))) return;
    setRunning(true);
    setMsg("正在抓取资讯并调用 AI，通常需要几十秒…");
    try {
      const res = await fetch("/api/admin/ai-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run" }),
      });
      const body = await res.json();
      if (res.ok) {
        setData({
          config: body.config,
          drafts: body.drafts,
          models: body.models,
          state: body.state,
        });
        const result = body.result as NewsRunLog;
        setMsg(
          `✅ 完成：发现 ${result.fetched} 条，生成 ${result.generated} 篇，发布 ${result.published} 篇` +
            (result.errors?.length ? `；${result.errors.length} 个问题见运行记录` : "")
        );
      } else {
        setMsg(`❌ ${body.error ?? "运行失败"}`);
      }
    } catch {
      setMsg("❌ 无法连接站点后端");
    } finally {
      setRunning(false);
    }
  }

  async function publish(id: string) {
    setMsg("发布中…");
    const res = await fetch("/api/admin/ai-news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish", id }),
    });
    const body = await res.json();
    if (res.ok) {
      setMsg(`✅ 已发布为文章：${body.draft.postSlug}`);
      await refresh();
    } else {
      setMsg(`❌ ${body.error ?? "发布失败"}`);
    }
  }

  async function remove(id: string) {
    if (!confirm("确定删除这条 AI 资讯记录吗？已发布的 Markdown 文章不会被删除。")) return;
    const res = await fetch(`/api/admin/ai-news?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) await refresh();
  }

  if (!data) return <p className="text-sm text-slate-mid">加载中…</p>;
  const { config, drafts, models, state } = data;

  return (
    <div className="space-y-8">
      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="card-soft p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-grotesk text-lg font-bold">自动抓取与 AI 编辑</h2>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-mid">
                从 RSS/Atom 读取最新条目，按链接去重后调用已配置模型，生成带来源说明的中文
                Markdown。自动发布关闭时，文章会进入下方待审队列。
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void persistConfig()}
                className="rounded-lg border border-hairline px-4 py-2 text-sm text-slate-mid hover:border-black hover:text-black"
              >
                保存配置
              </button>
              <button
                onClick={() => void runNow()}
                disabled={running}
                className="btn-black rounded-lg px-4 py-2 text-sm font-semibold disabled:cursor-wait disabled:opacity-50"
              >
                {running ? "执行中…" : "立即运行"}
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-lg border border-hairline px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ enabled: e.target.checked })}
              />
              启用自动定时任务
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-hairline px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={config.autoPublish}
                onChange={(e) => setConfig({ autoPublish: e.target.checked })}
              />
              生成后自动发布
            </label>
            <label className="block text-xs font-semibold text-slate-mid">
              生成模型
              <select
                value={config.model}
                onChange={(e) => setConfig({ model: e.target.value })}
                className="mt-1 w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
              >
                <option value="">使用模型映射第一项</option>
                {models.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-mid">
              文章分类
              <input
                value={config.category}
                onChange={(e) => setConfig({ category: e.target.value })}
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-mid">
              运行间隔（分钟，15–10080）
              <input
                type="number"
                min={15}
                max={10080}
                value={config.intervalMinutes}
                onChange={(e) => setConfig({ intervalMinutes: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-mid">
              每次最多生成（1–10）
              <input
                type="number"
                min={1}
                max={10}
                value={config.maxItemsPerRun}
                onChange={(e) => setConfig({ maxItemsPerRun: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-mid">
              只看最近多少小时（1–720）
              <input
                type="number"
                min={1}
                max={720}
                value={config.lookbackHours}
                onChange={(e) => setConfig({ lookbackHours: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
              />
            </label>
            <label className="flex items-end gap-2 pb-2 text-xs text-slate-mid">
              <input
                type="checkbox"
                checked={config.fetchArticle}
                onChange={(e) => setConfig({ fetchArticle: e.target.checked })}
              />
              尝试抓取新闻原网页正文（失败自动回退 RSS 摘要）
            </label>
          </div>

          <label className="mt-4 block text-xs font-semibold text-slate-mid">
            关键词过滤（逗号分隔，留空不过滤）
            <input
              value={config.keywords}
              onChange={(e) => setConfig({ keywords: e.target.value })}
              placeholder="AI, 人工智能, 大模型, OpenAI"
              className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
            />
          </label>
          <label className="mt-4 block text-xs font-semibold text-slate-mid">
            编辑风格提示
            <textarea
              rows={3}
              value={config.customPrompt}
              onChange={(e) => setConfig({ customPrompt: e.target.value })}
              className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
            />
          </label>
          {config.autoPublish && (
            <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700">
              自动发布已开启。建议先关闭自动发布运行几次，确认资讯源质量和模型文风后再开启。
            </p>
          )}
          {msg && <p className="mt-4 whitespace-pre-line text-xs text-slate-mid">{msg}</p>}
        </div>

        <div className="card-soft p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-grotesk text-lg font-bold">RSS / Atom 资讯源</h2>
              <p className="mt-1 text-xs text-slate-mid">建议使用官方博客、媒体或聚合搜索的订阅地址。</p>
            </div>
            <button
              onClick={() =>
                setConfig({
                  sources: [
                    ...config.sources,
                    {
                      id: `source-${Date.now().toString(36)}`,
                      name: `资讯源 ${config.sources.length + 1}`,
                      url: "",
                      enabled: true,
                    },
                  ],
                })
              }
              className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-slate-mid hover:border-black hover:text-black"
            >
              + 添加
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {config.sources.length === 0 && (
              <p className="rounded-lg bg-cloud px-4 py-3 text-xs leading-relaxed text-slate-mid">
                尚未添加资讯源。可添加支持 RSS 2.0 或 Atom 的地址；也可使用新闻聚合站按关键词生成的 RSS。
              </p>
            )}
            {config.sources.map((source, index) => (
              <div key={source.id} className="rounded-xl border border-hairline p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={source.enabled}
                    title="启用此源"
                    onChange={(e) => updateSource(index, { enabled: e.target.checked })}
                  />
                  <input
                    value={source.name}
                    placeholder="来源名称"
                    onChange={(e) => updateSource(index, { name: e.target.value })}
                    className="min-w-0 flex-1 rounded-lg border border-hairline px-3 py-1.5 text-sm font-semibold outline-none focus:border-black"
                  />
                  <button
                    onClick={() =>
                      setConfig({ sources: config.sources.filter((_, i) => i !== index) })
                    }
                    className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs text-red-500 hover:border-red-500"
                  >
                    删除
                  </button>
                </div>
                <input
                  value={source.url}
                  placeholder="https://example.com/feed.xml"
                  onChange={(e) => updateSource(index, { url: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-hairline px-3 py-1.5 text-xs outline-none focus:border-black"
                />
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg bg-cloud px-4 py-3 text-xs leading-relaxed text-slate-mid">
            <p>应用内调度：适合当前 Docker / Node 长驻部署，每分钟检查一次是否到期。</p>
            <p className="mt-1">
              外部调度：请求 <code>/api/cron/ai-news</code>，请求头使用
              <code> Authorization: Bearer $CRON_SECRET</code>；需在服务器配置同名环境变量。
            </p>
            <p className="mt-2">
              最近运行：{state.lastRunAt ? new Date(state.lastRunAt).toLocaleString() : "尚未运行"}
              {` · 已去重 ${state.seenCount} 条`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card-soft p-6">
          <h2 className="font-grotesk text-lg font-bold">
            AI 资讯队列（待审 {drafts.filter((draft) => draft.status === "draft").length}）
          </h2>
          <div className="mt-4 space-y-3">
            {drafts.length === 0 && (
              <p className="rounded-lg bg-cloud px-4 py-3 text-xs text-slate-mid">
                暂无生成记录。保存资讯源与模型设置后点“立即运行”。
              </p>
            )}
            {drafts.map((draft) => (
              <div key={draft.id} className="rounded-xl border border-hairline p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${draft.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {draft.status === "published" ? "已发布" : "待审核"}
                      </span>
                      <span className="text-[11px] text-slate-mid">{draft.sourceName}</span>
                    </div>
                    <p className="mt-2 text-sm font-bold">{draft.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-mid">{draft.excerpt}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {draft.status === "draft" && (
                      <button
                        onClick={() => void publish(draft.id)}
                        className="btn-black rounded-lg px-3 py-1.5 text-xs"
                      >
                        发布
                      </button>
                    )}
                    <button
                      onClick={() => void remove(draft.id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-500 hover:border-red-500"
                    >
                      删除记录
                    </button>
                  </div>
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs text-slate-mid hover:text-black">预览 Markdown</summary>
                  <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-cloud p-3 text-xs leading-relaxed">{draft.content}</pre>
                </details>
                <a
                  href={draft.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block truncate text-[11px] text-slate-mid underline"
                >
                  原文：{draft.originalTitle}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="card-soft p-6">
          <h2 className="font-grotesk text-lg font-bold">运行记录</h2>
          <div className="mt-4 space-y-3">
            {state.runs.length === 0 && <p className="text-xs text-slate-mid">暂无运行记录。</p>}
            {state.runs.slice(0, 12).map((run) => (
              <div key={run.id} className="rounded-lg border border-hairline px-3 py-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">
                    {run.trigger === "manual" ? "手动" : run.trigger === "cron" ? "外部 Cron" : "应用内定时"}
                  </span>
                  <span className="text-slate-mid">{new Date(run.finishedAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-slate-mid">
                  发现 {run.fetched} · 生成 {run.generated} · 发布 {run.published}
                </p>
                {run.errors.length > 0 && (
                  <details className="mt-1 text-red-600">
                    <summary className="cursor-pointer">{run.errors.length} 个问题</summary>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {run.errors.map((error, index) => <li key={index}>{error}</li>)}
                    </ul>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= 文章管理 ================= */

function PostsPanel() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [draft, setDraft] = useState<PostDraft>(EMPTY_DRAFT);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState("");

  const refresh = useCallback(() => {
    fetch("/api/admin/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []));
  }, []);

  useEffect(refresh, [refresh]);

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
        <label className="mt-3 block text-xs font-semibold text-slate-mid">
          正文（Markdown）
          <textarea
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            rows={14}
            placeholder={
              "支持完整 Markdown 语法。\n\n插入图片：![说明](https://图片地址)\n插入视频：<video src=\"https://视频地址\" controls style=\"max-width:100%\"></video>\n嵌入B站等：<iframe src=\"...\" ...></iframe>"
            }
            className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 font-mono text-sm font-normal text-black outline-none focus:border-black"
          />
        </label>
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
