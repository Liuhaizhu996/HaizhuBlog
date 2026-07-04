"use client";

import { useEffect, useRef } from "react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260329_050842_be71947f-f16e-4a14-810c-06e83d23ddb5.mp4";

/**
 * 循环视频背景，自定义 JS 淡入淡出系统（不用 CSS transition）：
 * - 加载/循环开始时 250ms requestAnimationFrame 淡入
 * - 距结尾 0.55s 时 250ms 淡出（fadingOutRef 防止 timeupdate 重复触发）
 * - ended：置 0 透明度 → 延迟 100ms → currentTime=0 → play → 淡入
 * - 每次新的淡入淡出都会取消进行中的动画帧，且从当前透明度继续（不跳变）
 */
export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const cancelFade = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };

    const fadeTo = (target: number, duration = 250) => {
      cancelFade();
      const from = parseFloat(video.style.opacity || "0");
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        video.style.opacity = String(from + (target - from) * t);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(step);
    };

    const onPlaying = () => {
      fadingOutRef.current = false;
      fadeTo(1);
    };

    const onTimeUpdate = () => {
      if (
        !fadingOutRef.current &&
        video.duration &&
        video.duration - video.currentTime <= 0.55
      ) {
        fadingOutRef.current = true;
        fadeTo(0);
      }
    };

    const onEnded = () => {
      cancelFade();
      video.style.opacity = "0";
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
        fadingOutRef.current = false;
        fadeTo(1);
      }, 100);
    };

    video.addEventListener("playing", onPlaying);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    video.play().catch(() => {});

    return () => {
      cancelFade();
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* 视频加载前/失败时的渐变兜底 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#eef4ec] via-[#f7f9f5] to-white" />
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        style={{ opacity: 0, width: "115%", height: "115%" }}
        className="absolute left-1/2 top-0 max-w-none -translate-x-1/2 object-cover object-top"
      />
      {/* 轻遮罩，保证文字对比度 */}
      <div className="absolute inset-0 bg-white/25" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white" />
    </div>
  );
}
