import type { Metadata } from "next";
import { getLinkGroups } from "@/lib/store";
import Reveal from "@/components/motion/Reveal";
import { ExternalLink } from "@/components/icons";

export const metadata: Metadata = {
  title: "站点导航",
  description: "HaizhuAI 精选的开源项目与实用站点导航，无广告、无跟踪。",
};

// 导航内容由后台管理，保持动态渲染
export const dynamic = "force-dynamic";

export default function LinksPage() {
  const linkGroups = getLinkGroups();
  return (
    <div className="mx-auto max-w-6xl px-6 pt-28">
      <Reveal>
        <p className="font-grotesk text-sm font-semibold text-[#2aa11d]">LINKS</p>
        <h1 className="font-display mt-1 text-5xl text-black md:text-6xl">
          站点导航
        </h1>
        <p className="mt-4 max-w-xl text-slate-mid">
          人工精选的开源项目与实用站点 ——
          无广告、无跟踪参数、无推广位，只收录真正好用的。
        </p>
      </Reveal>

      <div className="mt-12 space-y-14 pb-10">
        {linkGroups.map((group, gi) => (
          <section key={group.title}>
            <Reveal delay={gi * 0.05}>
              <h2 className="font-grotesk flex items-center gap-3 text-xl font-bold">
                {group.title}
                <span className="h-px flex-1 bg-hairline" />
                <span className="text-xs font-normal text-black/35">
                  {group.links.length} 个
                </span>
              </h2>
            </Reveal>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.links.map((l, i) => (
                <Reveal key={l.url} delay={(i % 3) * 0.06}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="card-soft group flex items-start justify-between gap-3 p-5"
                  >
                    <div className="min-w-0">
                      <p className="font-grotesk text-sm font-bold">{l.name}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-mid">
                        {l.desc}
                      </p>
                      <p className="mt-2 truncate text-xs text-black/30">
                        {new URL(l.url).hostname}
                      </p>
                    </div>
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-black/25 transition-colors group-hover:text-black" />
                  </a>
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mb-16 rounded-xl bg-cloud px-5 py-4 text-xs leading-relaxed text-slate-mid">
        📮 想推荐好站点？点右下角 💬 联系站长。本页内容由站长在后台维护，坚持三不原则：不放广告、不带跟踪参数、不收录低质站点。
      </p>
    </div>
  );
}
