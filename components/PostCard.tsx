import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

const categoryStyles: Record<string, string> = {
  资讯: "bg-[rgba(90,225,76,0.18)] text-[#1d7a12]",
  教程: "bg-black text-white",
  日常: "bg-cloud text-slate-mid",
};

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block h-full">
      <article className="card-soft flex h-full flex-col p-6">
        <div className="flex items-center justify-between text-xs">
          <span
            className={`rounded-md px-2.5 py-1 font-semibold ${
              categoryStyles[post.category] ?? categoryStyles["日常"]
            }`}
          >
            {post.category}
          </span>
          <time className="text-black/35">{post.date}</time>
        </div>
        <h3 className="font-grotesk mt-4 text-lg font-bold leading-snug tracking-[-0.3px]">
          {post.title}
        </h3>
        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-mid">
          {post.excerpt}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4 text-xs text-black/40">
          <span>约 {post.readingMinutes} 分钟读完</span>
          <span className="font-semibold text-black">阅读 →</span>
        </div>
      </article>
    </Link>
  );
}
