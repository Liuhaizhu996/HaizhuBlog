import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "HaizhuAI · 阅读、学习，与 AI 对话",
    template: "%s · HaizhuAI",
  },
  description:
    "HaizhuAI —— 一份「纸与墨」风格的数字刊物：分享资讯、教程与日常，并集成开源 AI 对话工具，让你边读边问。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        {/* 纸张颗粒质感 */}
        <div className="paper-grain" aria-hidden />

        <Navbar />
        <main className="relative">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
