"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowUp,
  Sparkle,
  Paperclip,
  Mic,
  SearchIcon,
} from "@/components/icons";

const samplePrompts = [
  "怎么在本地跑一个开源大模型？",
  "帮我总结一下写好提示词的要点",
  "推荐几款开源 AI 对话工具",
];

const MAX_LEN = 3000;

export default function HeroAsk() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [promptIdx, setPromptIdx] = useState(0);

  function submit() {
    const q = value.trim();
    router.push(q ? `/chat?q=${encodeURIComponent(q)}` : "/chat");
  }

  return (
    <div className="mx-auto w-full max-w-[728px] rounded-[18px] bg-[rgba(0,0,0,0.24)] p-4 backdrop-blur-md">
      {/* 顶行：额度信息（Schibsted Grotesk Medium 12px 白字） */}
      <div className="font-grotesk mb-3 flex items-center justify-between text-xs font-medium text-white">
        <div className="flex items-center gap-2.5">
          <span>免费体验 · 无需注册</span>
          <button
            onClick={() => router.push("/chat")}
            className="btn-lime rounded-md px-2.5 py-1 text-xs font-semibold"
          >
            接入模型
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkle className="h-3.5 w-3.5" />
          <span>Powered by 开源大模型</span>
        </div>
      </div>

      {/* 主输入区：白底圆角 12px */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-center gap-3 rounded-xl bg-white p-2.5 pl-4 shadow-lg shadow-black/10"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX_LEN))}
          placeholder="输入你的问题…"
          className="flex-1 bg-transparent text-base outline-none placeholder:text-black/60"
        />
        <button
          type="submit"
          aria-label="发送"
          className="btn-black flex h-9 w-9 items-center justify-center rounded-full"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>

      {/* 底行：动作按钮 + 字数统计 */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/chat")}
            title="到对话页上传文件"
            className="font-grotesk flex items-center gap-1.5 rounded-md bg-white/85 px-3 py-1.5 text-xs font-medium text-black/70 transition hover:bg-white"
          >
            <Paperclip className="h-3.5 w-3.5" />
            附件
          </button>
          <button
            title="语音输入即将支持"
            className="font-grotesk flex cursor-not-allowed items-center gap-1.5 rounded-md bg-white/60 px-3 py-1.5 text-xs font-medium text-black/40"
          >
            <Mic className="h-3.5 w-3.5" />
            语音
          </button>
          <button
            onClick={() => {
              setValue(samplePrompts[promptIdx % samplePrompts.length]);
              setPromptIdx((i) => i + 1);
            }}
            title="换一个示例提示词"
            className="font-grotesk flex items-center gap-1.5 rounded-md bg-white/85 px-3 py-1.5 text-xs font-medium text-black/70 transition hover:bg-white"
          >
            <SearchIcon className="h-3.5 w-3.5" />
            提示词
          </button>
        </div>
        <span className="text-xs text-white/80">
          {value.length.toLocaleString()}/3,000
        </span>
      </div>
    </div>
  );
}
