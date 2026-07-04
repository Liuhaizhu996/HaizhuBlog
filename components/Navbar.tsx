"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "文章" },
  { href: "/tools", label: "AI 工具" },
  { href: "/chat", label: "对话" },
  { href: "/about", label: "关于" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed top-0 z-40 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-rule bg-paper/90 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="group flex items-baseline gap-1">
          <span className="font-serif-display text-xl font-black tracking-tight">
            Haizhu
          </span>
          <span className="bg-vermilion px-1.5 py-0.5 text-sm font-black text-white transition-transform duration-300 group-hover:-rotate-3">
            AI
          </span>
        </Link>

        {/* 桌面导航 */}
        <ul className="hidden items-center gap-7 md:flex">
          {links.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`link-ink text-sm tracking-wide ${
                    active
                      ? "font-bold text-vermilion"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* 移动端汉堡 */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="打开菜单"
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 border border-ink md:hidden"
        >
          <span
            className={`h-0.5 w-4 bg-ink transition-transform ${open ? "translate-y-1 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-4 bg-ink transition-all ${open ? "-translate-y-1 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* 移动端菜单 */}
      {open && (
        <div className="border-t border-rule bg-paper md:hidden">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block border-b border-rule px-5 py-3.5 text-sm text-ink-soft hover:bg-paper-warm hover:text-ink"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
