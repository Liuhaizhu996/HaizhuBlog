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

/** 后台发布/更新文章：写入 content/posts/<slug>.md */
export function savePost(input: {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
}) {
  if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });
  const slug = input.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) throw new Error("slug 不能为空");
  const fm = matter.stringify(input.content, {
    title: input.title,
    date: input.date,
    category: input.category,
    excerpt: input.excerpt,
  });
  fs.writeFileSync(path.join(postsDir, `${slug}.md`), fm, "utf-8");
  return slug;
}

/** 后台删除文章 */
export function deletePost(slug: string) {
  const file = path.join(postsDir, `${slug}.md`);
  // 只允许删除 posts 目录内的 .md 文件
  if (path.dirname(file) !== postsDir) throw new Error("非法路径");
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

/** 后台编辑时取原始 Markdown */
export function getPostRaw(slug: string) {
  const file = path.join(postsDir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf-8"));
  return {
    slug,
    title: (data.title as string) ?? slug,
    date: (data.date as string) ?? "",
    category: (data.category as string) ?? "日常",
    excerpt: (data.excerpt as string) ?? "",
    content,
  };
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
