import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="text-lg font-bold">
              海竹<span className="text-aurora">小站</span>
            </p>
            <p className="mt-2 max-w-sm text-sm text-[--color-mist]">
              不止于博客 —— 在这里阅读、学习，并与 AI 一起探索。
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[--color-mist]">
            <Link href="/blog" className="hover:text-white">文章</Link>
            <Link href="/tools" className="hover:text-white">AI 工具</Link>
            <Link href="/chat" className="hover:text-white">对话</Link>
            <Link href="/about" className="hover:text-white">关于</Link>
          </nav>
        </div>
        <p className="mt-10 text-xs text-white/30">
          © {new Date().getFullYear()} 海竹小站 · 用心分享每一篇内容
        </p>
      </div>
    </footer>
  );
}
