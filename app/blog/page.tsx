import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import BlogList from "@/components/BlogList";
import Reveal from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "文章",
  description: "资讯、教程与日常 —— HaizhuAI 的全部文章。",
};

// 文章可在后台随时发布/删除，保持动态渲染
export const dynamic = "force-dynamic";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28">
      <Reveal>
        <p className="font-grotesk text-sm font-semibold text-[#2aa11d]">BLOG</p>
        <h1 className="font-display mt-1 text-5xl text-black md:text-6xl">
          全部文章
        </h1>
        <p className="mt-4 max-w-lg text-slate-mid">
          资讯速递、上手教程、日常随笔 —— 每一篇都认真写。
        </p>
      </Reveal>

      <BlogList posts={posts} />
    </div>
  );
}
