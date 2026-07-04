import Link from "next/link";
import { getLinkGroups } from "@/lib/store";

export default function Footer() {
  const friendLinks = getLinkGroups()
    .flatMap((g) => g.links)
    .slice(0, 6);
  return (
    <footer className="mt-24 border-t border-hairline bg-cloud/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl tracking-tight text-black">
            HaizhuAI<sup className="text-sm">®</sup>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-mid">
            分享资讯、教程与日常，并集成开源 AI 对话工具 ——
            在这里阅读、学习，并与 AI 一起探索。
          </p>
        </div>

        <nav>
          <p className="font-grotesk text-sm font-semibold">站内</p>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-mid">
            <li><Link href="/blog" className="hover:text-black">文章</Link></li>
            <li><Link href="/tools" className="hover:text-black">AI 工具</Link></li>
            <li><Link href="/chat" className="hover:text-black">AI 对话</Link></li>
            <li><Link href="/links" className="hover:text-black">站点导航</Link></li>
            <li><Link href="/about" className="hover:text-black">关于</Link></li>
          </ul>
        </nav>

        <nav>
          <p className="font-grotesk text-sm font-semibold">友情链接</p>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-mid">
            {friendLinks.map((l) => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="hover:text-black"
                >
                  {l.name}
                </a>
              </li>
            ))}
            <li>
              <Link href="/links" className="font-medium text-black hover:underline">
                更多 →
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-hairline">
        <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-5 text-xs text-slate-mid">
          <span>© {new Date().getFullYear()} HaizhuAI · 用心分享每一篇内容 · 无广告，无跟踪</span>
          <Link href="/admin" className="text-black/30 transition-colors hover:text-black">
            管理
          </Link>
        </p>
      </div>
    </footer>
  );
}
