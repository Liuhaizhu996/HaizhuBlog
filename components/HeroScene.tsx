"use client";

import { useEffect, useRef } from "react";

/**
 * 动态图片背景场景（替代视频背景）：
 * - 双图自适应：横版 fuji-landscape 适配桌面 UI，竖版 fuji-portrait 适配移动 UI
 * - 透明自适应：四周白色渐变遮罩，使画面自然融入页面背景
 * - 水面波纹：SVG feTurbulence + feDisplacementMap（SMIL 动画）扭曲画面下部
 *   水域，叠加扩散的椭圆涟漪圈
 * - 樱花漂落：程序化生成的花瓣粒子，随风摆动旋转下落
 * - 滚动视差：背景图、涟漪与花瓣按不同速率跟随滚动（rAF 驱动）
 */

/* 花瓣参数用确定性伪随机生成，保证 SSR/CSR 一致 */
const PETALS = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 53 + 7) % 100,
  delay: ((i * 1.9) % 14).toFixed(1),
  duration: (9 + (i % 6) * 2.2).toFixed(1),
  size: 8 + ((i * 37) % 9),
  spin: i % 2 === 0 ? 1 : -1,
}));

/* 涟漪圈落在水域（容器下部）内 */
const RIPPLES = Array.from({ length: 6 }, (_, i) => ({
  left: (i * 31 + 12) % 88,
  bottom: 4 + ((i * 13) % 26),
  delay: ((i * 2.3) % 9).toFixed(1),
  duration: (5 + (i % 3) * 1.5).toFixed(1),
}));

function SceneImage({ src, className }: { src: string; className?: string }) {
  return (
    <div className={className}>
      {/* 主图 */}
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        draggable={false}
      />
      {/* 水面波纹层：同一张图对齐叠放，只露出下部水域并施加湍流位移 */}
      <div
        className="absolute inset-0"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 54%, black 66%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 54%, black 66%)",
        }}
      >
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ filter: "url(#water-ripple)" }}
          draggable={false}
        />
      </div>
    </div>
  );
}

export default function HeroScene() {
  const bgRef = useRef<HTMLDivElement>(null);
  const fxRef = useRef<HTMLDivElement>(null);

  /* 滚动视差：背景 0.35 倍速、花瓣涟漪 0.15 倍速跟随滚动 */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (bgRef.current)
          bgRef.current.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
        if (fxRef.current)
          fxRef.current.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {/* SVG 滤镜定义：湍流噪声随时间流动，位移水面像素形成波纹 */}
      <svg width="0" height="0" className="absolute">
        <filter id="water-ripple" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.045"
            numOctaves="2"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="14s"
              values="0.012 0.045;0.016 0.06;0.012 0.045"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" />
        </filter>
      </svg>

      {/* 背景图层（视差 0.35x），overscan 避免视差移动露底 */}
      <div ref={bgRef} className="absolute -inset-x-0 -top-[12%] bottom-[-12%] will-change-transform">
        {/* 桌面：横版 */}
        <SceneImage
          src="/hero/fuji-landscape.webp"
          className="absolute inset-0 hidden md:block"
        />
        {/* 移动：竖版 */}
        <SceneImage
          src="/hero/fuji-portrait.webp"
          className="absolute inset-0 md:hidden"
        />
      </div>

      {/* 特效图层（视差 0.15x）：涟漪圈 + 落樱 */}
      <div ref={fxRef} className="absolute inset-0 will-change-transform">
        {RIPPLES.map((r, i) => (
          <span
            key={`r${i}`}
            className="ripple-ring"
            style={{
              left: `${r.left}%`,
              bottom: `${r.bottom}%`,
              animationDelay: `${r.delay}s`,
              animationDuration: `${r.duration}s`,
            }}
          />
        ))}
        {PETALS.map((p, i) => (
          <span
            key={`p${i}`}
            className="petal"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.82,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              ["--spin" as string]: p.spin,
            }}
          />
        ))}
      </div>

      {/* 透明自适应遮罩：画面向页面底色自然过渡，保证前景文字可读 */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/35 to-white" />
      <div className="absolute inset-y-0 left-0 w-[12%] bg-gradient-to-r from-white/60 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-[12%] bg-gradient-to-l from-white/60 to-transparent" />
      {/* 文字区域柔光，提升标题与副标题对比度 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 62% 42% at 50% 34%, rgb(255 255 255 / 0.55), transparent 70%)",
        }}
      />
    </div>
  );
}
