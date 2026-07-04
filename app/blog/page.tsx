import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import BlogList from "@/components/BlogList";
import Reveal from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "文章",
  description: "资讯、教程与日常 —— HaizhuAI 的全部文章。",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-6xl px-5 pt-28">
      <Reveal>
        <p className="text-xs font-bold tracking-[0.3em] text-vermilion">
          ARCHIVE / 文库
        </p>
        <h1 className="font-serif-display mt-2 text-4xl font-black md:text-6xl">
          全部文章
        </h1>
        <p className="mt-4 max-w-lg leading-relaxed text-ink-soft">
          资讯速递、上手教程、日常随笔 —— 每一篇都认真写。
        </p>
        <div className="rule-strong mt-8" />
      </Reveal>

      <BlogList posts={posts} />
    </div>
  );
}
