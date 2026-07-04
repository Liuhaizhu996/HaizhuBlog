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
    "HaizhuAI —— 分享资讯、教程与日常，并集成开源 AI 对话工具（支持模型选择与文件上传），让你边读边问。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* 按提示词要求加载 Schibsted Grotesk / Inter / Noto Sans / Fustat */}
        <link
          href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&family=Fustat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <Navbar />
        <main className="relative">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
