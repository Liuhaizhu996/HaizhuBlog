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
    <article className="mx-auto max-w-3xl px-6 pt-28">
      <Reveal>
        <Link href="/blog" className="link-under text-sm text-slate-mid">
          ← 返回文章列表
        </Link>

        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-3 text-xs text-black/40">
            <span className="rounded-md bg-black px-2.5 py-1 font-semibold text-white">
              {post.category}
            </span>
            <time>{post.date}</time>
            <span>约 {post.readingMinutes} 分钟</span>
          </div>
          <h1 className="font-grotesk mt-5 text-3xl font-bold leading-snug tracking-[-1px] md:text-4xl">
            {post.title}
          </h1>
        </header>

        <div className="mt-8 h-px bg-hairline" />

        <div
          className="prose-haizhu mt-6 pb-8"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {/* 底部引导 */}
        <div className="card-soft mb-10 p-6 text-center">
          <p className="text-sm text-slate-mid">
            读完有疑问？直接把问题（或这篇文章的文件）丢给站内 AI。
          </p>
          <Link
            href="/chat"
            className="btn-black mt-4 inline-block rounded-lg px-6 py-2.5 text-sm font-semibold"
          >
            去对话页提问 →
          </Link>
        </div>
      </Reveal>
    </article>
  );
}
