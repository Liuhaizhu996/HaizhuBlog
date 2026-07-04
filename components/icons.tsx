/** 全站通用 SVG 图标（描边风格，随 currentColor 着色） */

type IconProps = { className?: string };

export function ChevronDown({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowUp({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Star({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 1.5l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.2l-3.8 2 .7-4.2-3.1-3 4.3-.6L8 1.5z" />
    </svg>
  );
}

export function Sparkle({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 1l1.5 4L14 6.5l-4.5 1.5L8 12 6.5 8 2 6.5 6.5 5 8 1z" />
      <path d="M12.5 10.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" />
    </svg>
  );
}

export function Paperclip({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M13 7.5l-4.9 4.9a3.2 3.2 0 01-4.5-4.5l5.3-5.3a2.1 2.1 0 013 3l-5.3 5.3a1.05 1.05 0 01-1.5-1.5L9.8 4.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Mic({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="6" y="1.5" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3.5 7.5a4.5 4.5 0 009 0M8 12v2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function Plus({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Gear({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 1.8l.8 1.7 1.9-.3 1.1 1.5 1.7.8-.3 1.9 1 1.6-1 1.6.3 1.9-1.7.8-1.1 1.5-1.9-.3-.8 1.7-.8-1.7-1.9.3-1.1-1.5-1.7-.8.3-1.9-1-1.6 1-1.6-.3-1.9 1.7-.8 1.1-1.5 1.9.3L8 1.8z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function XMark({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ExternalLink({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6.5 3.5H3.8A1.3 1.3 0 002.5 4.8v7.4a1.3 1.3 0 001.3 1.3h7.4a1.3 1.3 0 001.3-1.3V9.5M9.5 2.5h4v4M13 3L7.5 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
