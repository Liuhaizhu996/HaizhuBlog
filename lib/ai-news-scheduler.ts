import { getAiNewsConfig, getAiNewsState, runAiNews } from "@/lib/ai-news";

declare global {
  // eslint-disable-next-line no-var
  var __haizhuAiNewsSchedulerStarted: boolean | undefined;
}

async function tick() {
  const config = getAiNewsConfig();
  if (!config.enabled || !config.sources.some((source) => source.enabled)) return;
  const state = getAiNewsState();
  const lastRun = state.lastRunAt ? Date.parse(state.lastRunAt) : 0;
  const dueAfter = config.intervalMinutes * 60 * 1_000;
  if (lastRun && Date.now() - lastRun < dueAfter) return;
  await runAiNews("schedule").catch((error) => {
    console.error("[ai-news] scheduled run failed", error);
  });
}

/** 长驻 Node/Docker 部署的应用内调度器；外部 Cron 仍可调用专用接口。 */
export function startAiNewsScheduler() {
  if (globalThis.__haizhuAiNewsSchedulerStarted) return;
  globalThis.__haizhuAiNewsSchedulerStarted = true;

  const first = setTimeout(() => void tick(), 10_000);
  first.unref?.();
  const timer = setInterval(() => void tick(), 60_000);
  timer.unref?.();
}
