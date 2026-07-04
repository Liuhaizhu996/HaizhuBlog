import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "海竹小站 · 分享、学习与 AI 工具",
    template: "%s · 海竹小站",
  },
  description:
    "一个不止于博客的个人站点：分享资讯、教程与日常，并集成开源 AI 对话工具，让你边聊边学。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        {/* 全局极光背景 */}
        <div className="aurora-field" aria-hidden>
          <div className="aurora-blob aurora-blob--violet" />
          <div className="aurora-blob aurora-blob--cyan" />
          <div className="aurora-blob aurora-blob--rose" />
        </div>
        <div className="grid-veil" aria-hidden />

        <Navbar />
        <main className="relative">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
