export type SEOData = {
  supportLanguages: string[];
  fallbackLanguage: string;
  languages: Record<
    string,
    { title: string; description: string; image: string }
  >;
};

export const SEO_DATA: SEOData = {
  // TODO: Change to your own support languages
  supportLanguages: ["zh", "en", "ja"],
  fallbackLanguage: "en",
  // TODO: Change to your own SEO data
  languages: {
    zh: {
      title: "AI 小说写作",
      description: "使用AI进行小说写作",
      image: "/images/global/novel_cn_tool_logo.png",
    },
    en: {
      title: "AI Novel Writing",
      description: "Using AI for novel writing",
      image: "/images/global/novel_en_tool_logo.png",
    },
    ja: {
      title: "AI小説執筆",
      description: "AIを使った小説執筆",
      image: "/images/global/novel_jp_tool_logo.png",
    },
  },
};
