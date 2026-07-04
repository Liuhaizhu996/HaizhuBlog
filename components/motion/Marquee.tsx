import type { ReactNode } from "react";

/**
 * 无缝循环跑马灯：内容渲染两份，CSS 动画平移 50%。
 */
export default function Marquee({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
      aria-hidden
    >
      <div className="marquee-track gap-6 pr-6">
        {children}
        {children}
      </div>
    </div>
  );
}
