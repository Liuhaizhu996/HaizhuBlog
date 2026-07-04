"use client";

import { useCallback, useEffect, useState } from "react";
import type { PostMeta } from "@/lib/posts";
import type { LinkGroup } from "@/lib/links";
import type { SiteSettings, AiTool } from "@/lib/store";

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

/* ================= AI 模型配置 ================= */

function AiPanel() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [msg, setMsg] = useState("");
  const [fetchMsg, setFetchMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings));
  }, []);

  async function fetchModels() {
    if (!settings) return;
    setFetchMsg("正在获取…");
    let res: Response;
    try {
      res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            provider: settings.ai.provider,
            baseUrl: settings.ai.baseUrl,
            apiKey: settings.ai.apiKey,
          },
        }),
      });
    } catch {
      setFetchMsg("无法连接站点后端，请检查站点服务是否正常");
      return;
    }
    let d: { error?: string; models?: string[] };
    try {
      d = await res.json();
    } catch {
      setFetchMsg(`站点后端返回异常（HTTP ${res.status}），请查看服务器日志`);
      return;
    }
    if (d.error) {
      setFetchMsg(d.error);
    } else if (Array.isArray(d.models) && d.models.length) {
      setSettings({ ...settings, ai: { ...settings.ai, models: d.models } });
      setFetchMsg(`已获取 ${d.models.length} 个模型，记得保存`);
    } else {
      setFetchMsg("服务未返回模型，保留当前列表");
    }
  }

  async function save() {
    if (!settings) return;
    setMsg("保存中…");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    setMsg(res.ok ? "✅ 已保存，对话页立即生效" : "❌ 保存失败");
  }

  if (!settings) return <p className="text-sm text-slate-mid">加载中…</p>;

  return (
    <div className="card-soft max-w-2xl p-6">
      <h2 className="font-grotesk text-lg font-bold">站点内置 AI 服务</h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-mid">
        在这里配置后，所有访客无需自行填写服务地址即可对话；密钥只保存在服务器
        data/ 目录，不会下发给浏览器。访客也仍可在对话页用自己的服务覆盖。
      </p>
      <div className="mt-5 grid gap-4">
        <label className="block text-xs font-semibold text-slate-mid">
          服务类型
          <select
            value={settings.ai.provider}
            onChange={(e) =>
              setSettings({
                ...settings,
                ai: { ...settings.ai, provider: e.target.value as "openai" | "ollama" },
              })
            }
            className="mt-1 w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
          >
            <option value="openai">OpenAI 兼容接口（DeepSeek / 通义 / 硅基流动 / OneAPI…）</option>
            <option value="ollama">Ollama</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-slate-mid">
          服务地址 Base URL
          <input
            value={settings.ai.baseUrl}
            onChange={(e) =>
              setSettings({ ...settings, ai: { ...settings.ai, baseUrl: e.target.value } })
            }
            placeholder="https://api.deepseek.com"
            className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
          />
        </label>
        <label className="block text-xs font-semibold text-slate-mid">
          API Key
          <input
            type="password"
            value={settings.ai.apiKey}
            onChange={(e) =>
              setSettings({ ...settings, ai: { ...settings.ai, apiKey: e.target.value } })
            }
            placeholder="sk-…"
            className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
          />
        </label>
        <label className="block text-xs font-semibold text-slate-mid">
          开放给访客的模型（逗号分隔；前台只能从这里选择）
          <div className="mt-1 flex gap-2">
            <input
              value={settings.ai.models.join(", ")}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ai: {
                    ...settings.ai,
                    models: e.target.value.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
                  },
                })
              }
              className="w-full rounded-lg border border-hairline px-3 py-2 text-sm font-normal text-black outline-none focus:border-black"
            />
            <button
              type="button"
              onClick={fetchModels}
              className="btn-black shrink-0 rounded-lg px-3 py-2 text-xs font-medium"
            >
              自动获取
            </button>
          </div>
          {fetchMsg && (
            <span className="mt-1 block whitespace-pre-line break-all text-xs font-normal text-slate-mid">
              {fetchMsg}
            </span>
          )}
        </label>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button onClick={save} className="btn-black rounded-lg px-6 py-2.5 text-sm font-semibold">
          保存配置
        </button>
        {msg && <span className="text-xs text-slate-mid">{msg}</span>}
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
