import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

const categoryStyles: Record<string, string> = {
  资讯: "border-[#38d4ff]/30 bg-[#38d4ff]/10 text-[#8ee4ff]",
  教程: "border-[#7c5cff]/30 bg-[#7c5cff]/10 text-[#b9a8ff]",
  日常: "border-[#ff5ca8]/30 bg-[#ff5ca8]/10 text-[#ff9ecb]",
};

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block h-full">
      <article className="glass glass-hover flex h-full flex-col rounded-3xl p-7">
        <div className="flex items-center gap-3 text-xs">
          <span
            className={`rounded-full border px-3 py-1 ${
              categoryStyles[post.category] ?? categoryStyles["日常"]
            }`}
          >
            {post.category}
          </span>
          <time className="text-white/35">{post.date}</time>
        </div>
        <h3 className="mt-4 text-lg font-bold leading-snug transition-colors group-hover:text-white">
          {post.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-[--color-mist]">
          {post.excerpt}
        </p>
        <div className="mt-5 flex items-center justify-between text-xs text-white/35">
          <span>约 {post.readingMinutes} 分钟读完</span>
          <span className="text-[#38d4ff]">阅读 →</span>
        </div>
      </article>
    </Link>
  );
}
