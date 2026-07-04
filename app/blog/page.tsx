import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import BlogList from "@/components/BlogList";
import Reveal from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "文章",
  description: "资讯、教程与日常 —— 海竹小站的全部文章。",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-6xl px-5 pt-32">
      <Reveal>
        <p className="text-sm font-medium tracking-widest text-[#38d4ff]">BLOG</p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">全部文章</h1>
        <p className="mt-4 max-w-lg text-[--color-mist]">
          资讯速递、上手教程、日常随笔 —— 每一篇都认真写。
        </p>
      </Reveal>

      <BlogList posts={posts} />
    </div>
  );
}
