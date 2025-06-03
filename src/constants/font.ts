export const fontList = () => {
  const defaultFont = [
    "默认字体",
    "宋体",
    "宋体Light",
    "黑体Light",
  ];

  const localeFont = {
    zh: [
      "粗圆体",
      // "方体",
      "行书",
      "行书简体",
      "雅黑",
      // "圆体",
      "珠海体",
    ],
    en: [
      "Arapey Thin",
      "Libre Baskerville Italic",
      "Playball Regular",
      "Poppins Bold Italic",
      "Poppins Extra Bold",
      "Poppins Light",
      "Poppins Regular",
      "Satisfy Regular",
      "Varela Regular",
    ],
    ja: [
      "Aoyagi Kouzan",
      "Kouzan Sousho",
      "Taiwan Pearl Extra Light",
      "Taiwan Pearl Regular",
      "お手製Rwi B",
      "お手製Rwi C 袋文字",
      "お手製Rwi C 立体",
      "お手製Rwi C",
    ]
  }

  const fontSizeList = [
    '12px',
    '13px',
    '14px',
    '15px',
    '16px',
    '19px',
    '22px',
    '24px',
    '29px',
    '32px',
    '40px',
    '48px',
  ]


  return { defaultFont, localeFont, fontSizeList }
};