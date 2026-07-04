/**
 * AI 服务地址处理工具。
 * 用户习惯从各类文档复制地址，常见形态有：
 *   https://api.xx.com
 *   https://api.xx.com/v1
 *   https://api.xx.com/v1/chat/completions
 *   https://api.xx.com/v1/models
 * 统一归一化为不带 /v1 的根地址，再由调用方拼接标准路径，
 * 避免出现 /v1/v1/models 这类 404。
 */

export function normalizeOpenAiBase(baseUrl: string): string {
  return baseUrl
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/v1\/chat\/completions$/, "")
    .replace(/\/v1\/models$/, "")
    .replace(/\/chat\/completions$/, "")
    .replace(/\/v1$/, "");
}

export function normalizeOllamaBase(baseUrl: string): string {
  return baseUrl
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api\/(chat|tags|generate)$/, "")
    .replace(/\/api$/, "");
}

/** 模型列表候选地址（依次尝试，兼容不同网关的路径习惯） */
export function modelListCandidates(
  provider: "openai" | "ollama",
  baseUrl: string
): string[] {
  if (provider === "ollama") {
    return [`${normalizeOllamaBase(baseUrl)}/api/tags`];
  }
  const base = normalizeOpenAiBase(baseUrl);
  return [`${base}/v1/models`, `${base}/models`];
}
