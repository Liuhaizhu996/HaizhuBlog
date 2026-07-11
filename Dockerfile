# ---------- 依赖层 ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- 构建层 ----------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- 运行层 ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# standalone 产物自带精简后的 node_modules 与 server.js
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# 示例文章一并带入（后台发布的新文章也写到这里）
COPY --from=builder /app/content ./content

# data/ 存后台配置（settings/ai-news/links/tools/auth/tgchat），需可写
RUN mkdir -p data content/posts \
  && chown -R nextjs:nodejs data content

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
