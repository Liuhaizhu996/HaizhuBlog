import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/posts";
import Reveal from "@/components/motion/Reveal";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(decodeURIComponent(slug));
  if (!post) return { title: "文章不存在" };
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(decodeURIComponent(slug));
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 pt-32">
      <Reveal>
        <Link
          href="/blog"
          className="text-sm text-[--color-mist] transition-colors hover:text-white"
        >
          ← 返回文章列表
        </Link>

        <header className="mt-8">
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span className="rounded-full border border-[#7c5cff]/30 bg-[#7c5cff]/10 px-3 py-1 text-[#b9a8ff]">
              {post.category}
            </span>
            <time>{post.date}</time>
            <span>约 {post.readingMinutes} 分钟</span>
          </div>
          <h1 className="mt-5 text-3xl font-black leading-tight md:text-4xl">
            {post.title}
          </h1>
        </header>

        <div className="mt-6 h-px bg-gradient-to-r from-[#7c5cff]/50 via-[#38d4ff]/30 to-transparent" />

        <div
          className="prose-haizhu mt-8 pb-8"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {/* 底部引导 */}
        <div className="glass mb-8 rounded-2xl p-6 text-center">
          <p className="text-sm text-[--color-mist]">
            读完有疑问？以后可以直接在站内向 AI 提问。
          </p>
          <Link
            href="/chat"
            className="mt-3 inline-block text-sm font-semibold text-[#38d4ff] hover:underline"
          >
            去对话页看看 →
          </Link>
        </div>
      </Reveal>
    </article>
  );
}
