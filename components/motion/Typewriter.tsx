"use client";

import { useEffect, useState } from "react";

/**
 * 循环打字机：依次打出/删除 phrases 中的短语。
 * 编辑风样式：衬线斜体 + 朱砂色光标。
 */
export default function Typewriter({ phrases }: { phrases: string[] }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[index % phrases.length];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text.length < current.length) {
      timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), 90);
    } else if (!deleting && text.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && text.length > 0) {
      timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), 40);
    } else {
      timeout = setTimeout(() => {
        setDeleting(false);
        setIndex((i) => (i + 1) % phrases.length);
      }, 300);
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, index, phrases]);

  return (
    <span className="font-serif-display italic text-vermilion">
      {text}
      <span className="ml-0.5 inline-block h-[1em] w-[2.5px] translate-y-[0.12em] animate-pulse bg-vermilion" />
    </span>
  );
}
