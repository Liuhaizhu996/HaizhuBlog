"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "@/components/icons";

const links = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "文章" },
  { href: "/tools", label: "AI 工具", dropdown: true },
  { href: "/links", label: "站点导航" },
  { href: "/about", label: "关于" },
];

const toolsMenu = [
  { href: "/chat", label: "AI 对话", desc: "选择模型 · 上传文件" },
  { href: "/tools", label: "工具广场", desc: "全部工具与接入计划" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setDropdown(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setDropdown(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <header
      className={`fixed top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-hairline bg-white/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      {/* 提示词规格：水平 120px / 垂直 16px 内边距 */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-[120px]">
        <Link href="/" className="font-display text-3xl tracking-tight text-black">
          HaizhuAI<sup className="text-sm">®</sup>
        </Link>

        {/* 桌面导航（Schibsted Grotesk Medium 16px, -0.2px tracking） */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href) ||
                  (item.dropdown && pathname.startsWith("/chat"));

            if (item.dropdown) {
              return (
                <li key={item.href} ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setDropdown((v) => !v)}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                      active ? "text-black" : "text-[#6F6F6F] hover:text-black"
                    }`}
                  >
                    {item.label}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${dropdown ? "rotate-180" : ""}`}
                    />
                  </button>
                  {dropdown && (
                    <div className="absolute left-1/2 top-full mt-3 w-56 -translate-x-1/2 rounded-xl border border-hairline bg-white p-2 shadow-xl shadow-black/5">
                      {toolsMenu.map((m) => (
                        <Link
                          key={m.href}
                          href={m.href}
                          className="block rounded-lg px-3.5 py-2.5 hover:bg-cloud"
                        >
                          <span className="font-grotesk block text-sm font-semibold">
                            {m.label}
                          </span>
                          <span className="text-xs text-slate-mid">{m.desc}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`text-sm transition-colors ${
                    active ? "text-black" : "text-[#6F6F6F] hover:text-black"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* 右侧 CTA */}
        <div className="hidden items-center md:flex">
          <Link
            href="/chat"
            className="rounded-full bg-black px-6 py-2.5 text-sm text-white transition-transform duration-200 hover:scale-[1.03]"
          >
            开始对话
          </Link>
        </div>

        {/* 移动端汉堡 */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="打开菜单"
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg border border-hairline bg-white md:hidden"
        >
          <span
            className={`h-0.5 w-4 bg-black transition-transform ${open ? "translate-y-1 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-4 bg-black transition-all ${open ? "-translate-y-1 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* 移动端菜单 */}
      {open && (
        <div className="border-t border-hairline bg-white md:hidden">
          {[...links, { href: "/chat", label: "AI 对话" }].map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="block border-b border-hairline px-6 py-3.5 text-sm text-slate-mid hover:bg-cloud hover:text-black"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
