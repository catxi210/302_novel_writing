'use server'

import { generateText } from 'ai';
import { createAI302 } from '@302ai/ai-sdk';

const baseURL = process.env.NEXT_PUBLIC_API_URL

interface IParams {
  apiKey: string;
  modelName: string;
  nationality: 'zh' | 'en' | 'ja';
  userRequire: string;
}

const getPrompt = (nationality: string, userRequire: string) => {
  return {
    zh: `你是一名专业的姓名助理。请根据以下信息生成姓名建议：

姓氏来源：

百家姓：[赵, 钱, 孙, 李, 周, 吴, 郑, 王, 冯, 陈, 楮, 卫, 蒋, 沈, 韩, 杨, 朱, 秦, 尤, 许, 何, 吕, 施, 张, 孔, 曹, 严, 华, 金, 魏, 陶, 姜, 戚, 谢, 邹, 喻, 柏, 水, 窦, 章, 云, 苏, 潘, 葛, 奚, 范, 彭, 郎, 鲁, 韦, 昌, 马, 苗, 凤, 花, 方, 俞, 任, 袁, 柳, 酆, 鲍, 史, 唐, 费, 廉, 岑, 薛, 雷, 贺, 倪, 汤, 滕, 殷, 罗, 毕, 郝, 邬, 安, 常, 乐, 于, 时, 傅, 皮, 卞, 齐, 康, 伍, 余, 元, 卜, 顾, 孟, 平, 黄, 和, 穆, 萧, 尹, 姚, 邵, 湛, 汪, 祁, 毛, 禹, 狄, 米, 贝, 明, 臧, 计, 伏, 成, 戴, 谈, 宋, 茅, 庞, 熊, 纪, 舒, 屈, 项, 祝, 董, 梁, 杜, 阮, 蓝, 闵, 席, 季, 麻, 强, 贾, 路, 娄, 危, 江, 童, 颜, 郭, 梅, 盛, 林, 刁, 钟, 徐, 邱, 骆, 高, 夏, 蔡, 田, 樊, 胡, 凌, 霍, 虞, 万, 支, 柯, 昝, 管, 卢, 莫, 经, 房, 裘, 缪, 干, 解, 应, 宗, 丁, 宣, 贲, 邓, 郁, 单, 杭, 洪, 包, 诸, 左, 石, 崔, 吉, 钮, 龚, 程, 嵇, 邢, 滑, 裴, 陆, 荣, 翁, 荀, 羊, 於, 惠, 甄, 麴, 家, 封, 芮, 羿, 储, 靳, 汲, 邴, 糜, 栾, 权, 益, 夔, 隆, 司, 卻, 晏, 鲂, 裔, 蹇, 觉, 诫, 盒, 戎, 胥, 匙, 符, 边, 坤, 熊, 霖, 薛, 颜, 沂, 伍, 博, 秦, 宓, 黎, 众, 沒, 蒙, 哲, 竞, 雪, 欣, 烈, 瀚, 留, 党, 望, 渤, 赣, 湖, 浩, 浙, 珠, 陕, 渔, 驼, 旋, 顺, 划, 浮, 平, 烁, 杭, 柿,]
复姓：[欧阳, 司徒, 上官, 司马, 诸葛, 东方, 皇甫, 尉迟, 公孙, 令狐, 西门, 夏侯, 赫连, 闻人, 慕容, 申屠, 拓跋, 百里, 南宫, 濮阳, 宇文, 钟离, 长孙, 澹台, 苗怀, 鲜于, 宗政, 公冶]

要求：姓名由姓氏和名字组成，若仅提供名字，则从百家姓或复姓中随机挑选作为姓氏。注意：不能将名字当成姓氏

用户要求：${userRequire}

请根据上述要求生成24个有意义的中文姓名，用英文逗号分隔。直接输出姓名，无需额外解释。`,
    en: `You are a professional name assistant. Please generate name suggestions based on the following information:

Requirements: Names should consist of a first name and last name, following English naming conventions. Names should be meaningful and appropriate.

User request: ${userRequire}

Please generate 24 meaningful names according to the above requirements, separated by English commas. Output only the names without additional explanation.`,
    ja: `あなたは専門の名前アシスタントです。以下の情報に基づいて名前の提案を生成してください：

要件：名前は姓と名で構成され、日本の命名慣習に従います。名前は意味があり、適切であるべきです。

ユーザーのリクエスト：${userRequire}

上記の要件に従って24個の意味のある名前を生成し、英語のカンマで区切ってください。追加の説明なしで名前のみを出力してください。`
  }[nationality]
}

export const generateName = async (params: IParams) => {
  const { apiKey, nationality, modelName, userRequire } = params;
  try {
    const model = createAI302({ apiKey, baseURL });
    const content = getPrompt(nationality, userRequire) || '';
    console.log(content);
    
    const { text } = await generateText({
      model: model.chatModel(modelName),
      messages: [{ role: 'user', content }]
    });

    return { data: text };

  } catch (error: any) {
    console.log(error);

    try {
      if (error.responseBody) {
        const errorData = JSON.parse(error.responseBody);
        return { ...errorData }
      }
      return { error: 'Generation failed' }
    } catch (error) {
      return { error: 'Generation failed' }
    }
  }
}