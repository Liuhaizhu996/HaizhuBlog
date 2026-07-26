import fs from "fs";
import path from "path";

/**
 * 对外提供 data/uploads/ 中的图片访问（后台上传的文章配图）。
 * 图片存在 data/ 目录是为了随 Docker 卷持久化，standalone 产物
 * 不会打包运行期新增的 public 文件，因此用路由动态读取。
 */

export const dynamic = "force-dynamic";

const uploadsDir = path.join(process.cwd(), "data", "uploads");

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await ctx.params;
  const file = path.resolve(uploadsDir, ...(segments ?? []));
  // 防路径穿越：解析后必须仍在 uploads 目录内
  if (!file.startsWith(uploadsDir + path.sep)) {
    return new Response("Not found", { status: 404 });
  }
  const mime = MIME[path.extname(file).toLowerCase()];
  if (!mime || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(new Uint8Array(fs.readFileSync(file)), {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
