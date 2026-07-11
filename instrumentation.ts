export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startAiNewsScheduler } = await import("@/lib/ai-news-scheduler");
  startAiNewsScheduler();
}
