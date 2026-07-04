"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PostMeta } from "@/lib/posts";
import PostCard from "@/components/PostCard";

const categories = ["全部", "资讯", "教程", "日常"];

export default function BlogList({ posts }: { posts: PostMeta[] }) {
  const [active, setActive] = useState("全部");

  const filtered =
    active === "全部" ? posts : posts.filter((p) => p.category === active);

  return (
    <div className="mt-10 pb-10">
      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`relative rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              active === cat ? "text-white" : "text-slate-mid hover:text-black"
            }`}
          >
            {active === cat && (
              <motion.span
                layoutId="cat-pill"
                className="absolute inset-0 rounded-full bg-black"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative">{cat}</span>
          </button>
        ))}
      </div>

      {/* 文章网格 */}
      <motion.div layout className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((post) => (
            <motion.div
              key={post.slug}
              layout
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.3 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center text-slate-mid">
          这个分类还没有文章，敬请期待～
        </p>
      )}
    </div>
  );
}
