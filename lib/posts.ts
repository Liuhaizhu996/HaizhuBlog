import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const postsDir = path.join(process.cwd(), "content/posts");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  category: string; // 资讯 / 教程 / 日常
  excerpt: string;
  readingMinutes: number;
};

export type Post = PostMeta & { html: string };

function estimateReadingMinutes(content: string): number {
  // 中文按字数、英文按词数粗略估算
  const cjk = (content.match(/[一-鿿]/g) ?? []).length;
  const words = content.replace(/[一-鿿]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(cjk / 400 + words / 200));
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDir)) return [];
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(postsDir, file), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? "",
        category: data.category ?? "日常",
        excerpt: data.excerpt ?? content.slice(0, 80),
        readingMinutes: estimateReadingMinutes(content),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | null {
  const file = path.join(postsDir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "",
    category: data.category ?? "日常",
    excerpt: data.excerpt ?? content.slice(0, 80),
    readingMinutes: estimateReadingMinutes(content),
    html: marked.parse(content) as string,
  };
}

export const categories = ["全部", "资讯", "教程", "日常"] as const;
