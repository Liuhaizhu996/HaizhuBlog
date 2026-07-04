/**
 * 站点导航 / 友情快捷链接。
 * 人工精选，无广告、无跟踪参数；渲染时统一加 rel="noopener noreferrer nofollow"。
 */

export type SiteLink = {
  name: string;
  desc: string;
  url: string;
};

export type LinkGroup = {
  title: string;
  links: SiteLink[];
};

export const linkGroups: LinkGroup[] = [
  {
    title: "模型与社区",
    links: [
      { name: "Hugging Face", desc: "全球最大的开源模型社区", url: "https://huggingface.co" },
      { name: "魔搭 ModelScope", desc: "阿里开源模型社区，国内速度快", url: "https://modelscope.cn" },
      { name: "OpenRouter", desc: "一个 Key 调用上百种模型", url: "https://openrouter.ai" },
      { name: "DeepSeek 开放平台", desc: "高性价比的国产模型 API", url: "https://platform.deepseek.com" },
      { name: "SiliconFlow 硅基流动", desc: "国内 OpenAI 兼容模型聚合", url: "https://siliconflow.cn" },
      { name: "Anthropic Claude", desc: "Claude 模型与 API 文档", url: "https://www.anthropic.com" },
    ],
  },
  {
    title: "开发与学习",
    links: [
      { name: "GitHub", desc: "全球最大的代码托管平台", url: "https://github.com" },
      { name: "MDN Web Docs", desc: "最权威的 Web 开发文档", url: "https://developer.mozilla.org/zh-CN/" },
      { name: "Stack Overflow", desc: "程序员问答社区", url: "https://stackoverflow.com" },
      { name: "掘金", desc: "中文技术内容社区", url: "https://juejin.cn" },
      { name: "Linux.do", desc: "新兴的开发者交流社区", url: "https://linux.do" },
      { name: "阮一峰的网络日志", desc: "每周科技爱好者周刊", url: "https://www.ruanyifeng.com/blog/" },
    ],
  },
  {
    title: "实用工具",
    links: [
      { name: "Excalidraw", desc: "手绘风格的在线白板", url: "https://excalidraw.com" },
      { name: "regex101", desc: "正则表达式在线调试", url: "https://regex101.com" },
      { name: "TinyPNG", desc: "在线图片无损压缩", url: "https://tinypng.com" },
      { name: "Carbon", desc: "生成漂亮的代码截图", url: "https://carbon.now.sh" },
      { name: "It-Tools", desc: "开发者瑞士军刀工具箱", url: "https://it-tools.tech" },
      { name: "Wappalyzer", desc: "识别网站使用的技术栈", url: "https://www.wappalyzer.com" },
    ],
  },
];
