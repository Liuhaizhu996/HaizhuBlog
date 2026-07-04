"use client";

import { useEffect, useRef } from "react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

const FADE = 0.5; // 秒

/**
 * 电影感循环视频背景（按提示词规格）：
 * - requestAnimationFrame 持续监测 currentTime / duration
 * - 开头 0.5s 淡入（0→1），结尾前 0.5s 淡出（1→0）
 * - ended：置 0 → 等 100ms → currentTime=0 → play()，形成无缝手动循环
 * - 定位：top 300px，inset auto 0 0 0
 * - 上方叠加 from-背景 via-transparent to-背景 的渐变遮罩
 */
export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const monitor = () => {
      const { currentTime, duration } = video;
      if (duration && !Number.isNaN(duration)) {
        let opacity = 1;
        if (currentTime < FADE) {
          opacity = currentTime / FADE; // 开头淡入
        } else if (duration - currentTime < FADE) {
          opacity = Math.max(0, (duration - currentTime) / FADE); // 结尾淡出
        }
        video.style.opacity = String(opacity);
      }
      rafRef.current = requestAnimationFrame(monitor);
    };

    const onEnded = () => {
      video.style.opacity = "0";
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
      }, 100);
    };

    video.addEventListener("ended", onEnded);
    video.play().catch(() => {});
    rafRef.current = requestAnimationFrame(monitor);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {/* 视频加载前 / 失败时的柔和兜底 */}
      <div
        className="absolute bg-gradient-to-b from-white via-[#f3f4f0] to-[#e9ebe4]"
        style={{ top: "300px", right: 0, bottom: 0, left: 0 }}
      />
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        style={{ top: "300px", right: 0, bottom: 0, left: 0, opacity: 0 }}
        className="absolute h-auto w-full object-cover"
      />
      {/* 渐变遮罩：from-background via-transparent to-background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
    </div>
  );
}
