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
    <article className="mx-auto max-w-3xl px-5 pt-28">
      <Reveal>
        <Link
          href="/blog"
          className="link-ink text-sm text-ink-soft"
        >
          ← 返回文章列表
        </Link>

        <header className="mt-10">
          <div className="flex flex-wrap items-center gap-3 text-xs tracking-wider text-ink-faint">
            <span className="bg-vermilion px-2.5 py-1 font-bold text-white">
              {post.category}
            </span>
            <time>{post.date}</time>
            <span>约 {post.readingMinutes} 分钟</span>
          </div>
          <h1 className="font-serif-display mt-6 text-3xl font-black leading-snug md:text-5xl">
            {post.title}
          </h1>
        </header>

        <div className="rule-strong mt-8" />

        <div
          className="prose-haizhu mt-8 pb-8"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {/* 底部引导 */}
        <div className="ink-card mb-10 p-7 text-center">
          <p className="text-sm text-ink-soft">
            读完有疑问？以后可以直接在站内向 AI 提问。
          </p>
          <Link
            href="/chat"
            className="link-ink mt-3 inline-block text-sm font-bold text-vermilion"
          >
            去对话页看看 →
          </Link>
        </div>
      </Reveal>
    </article>
  );
}
