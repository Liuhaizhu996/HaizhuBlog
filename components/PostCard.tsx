import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block h-full">
      <article className="ink-card flex h-full flex-col p-7">
        <div className="flex items-center justify-between text-xs tracking-wider">
          <span className="bg-ink px-2.5 py-1 font-bold text-paper">
            {post.category}
          </span>
          <time className="text-ink-faint">{post.date}</time>
        </div>
        <h3 className="font-serif-display mt-5 text-xl font-bold leading-snug">
          {post.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-faint">
          {post.excerpt}
        </p>
        <div className="rule-h mt-6" />
        <div className="mt-4 flex items-center justify-between text-xs text-ink-faint">
          <span>约 {post.readingMinutes} 分钟读完</span>
          <span className="font-bold text-vermilion">阅读 →</span>
        </div>
      </article>
    </Link>
  );
}
