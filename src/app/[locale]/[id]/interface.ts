export interface IChapter {
  id?: number;
  name: string;
  content: string;
  parentId: number;
  updatedAt: string;
}

export interface IDraft {
  id?: number;
  parentId: number;
  name: string;
  content: string;
  updatedAt: string;
}

export interface ICharacter {
  id?: number;
  name: string;
  content: string;
  parentId: number;
  labelColor: string;
}

export interface IInspiration {
  id: string;
  content: string;
  time: string
}


export interface ISetting {
  id?: number;
  parentId: number;
  storyBackground: string;
  outline: {
    id: string;
    content: string;
    mindMap: string;
    createdAt: string;
  }[];
  writingStyle: {
    value: string
    customize: string;
  };
  character: ICharacter[];
  inspiration: IInspiration[]
}

/**
 * 页面布局
 * @titleTextAlign 标题文本位置 'left' | 'center' | 'right'
 * @editorSize  编辑器宽度 窄:640 标准:800 宽:1280
 * @letterSpacing 字体间距
 * @lineHeight 行间距
 * @sideMargin 左右间距
 * @bottomSafetyDistance 底部安全距离
 */
export interface IPageLayout {
  titleTextAlign: 'left' | 'center' | 'right';  // 
  editorSize: 640 | 800 | 1280;  // 编辑器宽度
  letterSpacing: number;  // 字体间距
  lineHeight: number;  // 行间距
  sideMargin: number;  // 左右间距
  bottomSpacing: number;  // 底部安全距离 
}

/**
 * 更多设置
 * @enableFirstLineIndent  是否启用首行缩进
 * @enableParagraphSpacing 是否启用段落空行
 * @ignorePunctuation      是否忽略标点符号
 * @scrollToBottomOnOpen   打开时是否滚动到文章末尾
 */
export interface IMoreSettings {
  enableFirstLineIndent: boolean;
  enableParagraphSpacing: boolean;
  ignorePunctuation: boolean;
  scrollToBottomOnOpen: boolean;
}

/**
 * 字体
 * @font       字体
 * @fontSize   字体大小
 * @textColor  字体颜色
 * @bold       加粗
 * @italic     斜体
 * @underline  下划线
 */
export interface IFont {
  font: string;
  fontSize: string;
  textColor: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}


/**
 * 主题
 * @themeColor      主题颜色
 * @paper           纸张
 * @backgroundImage 背景图
 * @solidColor      纯色
 * @sidebarTransparency 侧边栏透明度
 */
export interface ITheme {
  themeColor: string;
  paper: string;
  backgroundImage: string;
  solidColor: string;
  paperType: 'paper' | 'back' | 'none';
  sidebarTransparency: number;
}

/**
 * 随机起名
 * @nationality   国际
 * @gender        性别
 * @nameWordCount 名字字数
 * @surname       姓氏
 * @name          名字
 */
export interface IRandomNaming {
  nationality: 'zh' | 'en' | 'ja';
  userRequire: string;
  list: {
    zh: string[],
    en: string[],
    ja: string[]
  };
}