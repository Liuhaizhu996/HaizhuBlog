import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-24">
      <div className="rule-strong mx-auto max-w-6xl" />
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="font-serif-display text-2xl font-black">
              Haizhu<span className="bg-vermilion px-1.5 text-white">AI</span>
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-faint">
              一份数字刊物 —— 在这里阅读、学习，并与 AI 一起探索。
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
            <Link href="/blog" className="link-ink">文章</Link>
            <Link href="/tools" className="link-ink">AI 工具</Link>
            <Link href="/chat" className="link-ink">对话</Link>
            <Link href="/about" className="link-ink">关于</Link>
          </nav>
        </div>
        <div className="rule-h mt-10" />
        <p className="mt-5 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
          <span>© {new Date().getFullYear()} HaizhuAI</span>
          <span aria-hidden>·</span>
          <span>纸与墨，字与光</span>
        </p>
      </div>
    </footer>
  );
}
