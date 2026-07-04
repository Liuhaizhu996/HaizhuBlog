import type { ReactNode } from "react";

/**
 * 报纸风新闻滚动条（ticker）：内容渲染两份，CSS 动画平移 50% 实现无缝循环。
 */
export default function Marquee({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden border-y border-ink bg-paper-warm py-2.5" aria-hidden>
      <div className="ticker-track items-center gap-8 pr-8">
        {children}
        {children}
      </div>
    </div>
  );
}
