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
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "glass shadow-lg shadow-black/20" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#38d4ff] text-sm font-black text-white transition-transform duration-300 group-hover:rotate-12">
            海
          </span>
          <span className="text-base font-bold tracking-wide">
            海竹<span className="text-aurora">小站</span>
          </span>
        </Link>

        {/* 桌面导航 */}
        <ul className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                    active
                      ? "text-white"
                      : "text-[--color-mist] hover:text-white"
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/15" />
                  )}
                  <span className="relative">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* 移动端汉堡 */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="打开菜单"
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg glass md:hidden"
        >
          <span
            className={`h-0.5 w-4 bg-white transition-transform ${open ? "translate-y-1 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-4 bg-white transition-all ${open ? "-translate-y-1 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* 移动端菜单 */}
      {open && (
        <div className="glass mx-4 mb-3 rounded-2xl p-2 md:hidden">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block rounded-xl px-4 py-3 text-sm text-[--color-mist] hover:bg-white/5 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
