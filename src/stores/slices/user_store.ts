import { IBookCard } from "@/components/bookCard/interface";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { IFont, IMoreSettings, IPageLayout, IRandomNaming, ITheme } from "@/app/[locale]/[id]/interface";

export interface IFrom {
  synopsis: string; //故事前情概要
  synopsisCustomize: string; //故事前情概要 自定义
  backgroundStory: string; // 故事背景
  writingStyle: string; //行文风格
  writingStyleCustomize: string; //行文风格 自定义
  fragmentedPlot: string; // 片段剧情
  writingRequirements: string; // 写作要求
  previousClip: string;// 前一片段
  previousClipCustomize: string;// 前一片段
  character: number[]; // 人物角色
  contentPlanning: string; //新章节内容规划
  introduction: string; // 小数简介
  chapterCount: number; //章节总数
  chapterOrder: number;//当前章节序号
}

export type UserConfigState = {
  bookshelf: IBookCard[];
  layoutData: IPageLayout;
  opneRightMenu: string;
  moreSettingData: IMoreSettings;
  fontData: IFont;
  themeData: ITheme;
  randomNamingData: IRandomNaming;
  typingTime: number;
  freeTime: number;
  typing: boolean;
  isFreeTime: boolean;
  typingLength: number;
  dayTypingLength: number;
  oldDayTypingLength: number;
  bookName: string;
  tempModel: string;
  writingForm: {
    [key: string]: IFrom
  },
};


export const userConfigAtom = atomWithStorage<UserConfigState>(
  "userConfig",
  {
    bookshelf: [],
    opneRightMenu: '',
    layoutData: {
      titleTextAlign: 'center',
      editorSize: 800,
      letterSpacing: 0,
      lineHeight: 1.5,
      sideMargin: 10,
      bottomSpacing: 10,
    },
    moreSettingData: {
      enableFirstLineIndent: true,
      enableParagraphSpacing: true,
      ignorePunctuation: false,
      scrollToBottomOnOpen: false,
    },
    fontData: {
      font: '默认字体',
      fontSize: '16px',
      textColor: '#333333',
      bold: false,
      italic: false,
      underline: false,
    },
    themeData: {
      themeColor: '#F5F5F5',
      paper: '',
      backgroundImage: '',
      solidColor: '',
      paperType: 'none',
      sidebarTransparency: 1,
    },
    randomNamingData: {
      nationality: 'zh',
      userRequire: '',
      list: {
        zh: [],
        en: [],
        ja: [],
      },
    },
    typingTime: 0,
    freeTime: 0,
    typing: false,
    isFreeTime: false,
    typingLength: 0,
    dayTypingLength: 0,
    oldDayTypingLength: 0,
    bookName: '',
    tempModel: '',
    writingForm: {},
  },
  createJSONStorage(() =>
    typeof window !== "undefined"
      ? sessionStorage
      : {
        getItem: () => null,
        setItem: () => null,
        removeItem: () => null,
      }
  ),
  {
    getOnInit: true,
  }
);
