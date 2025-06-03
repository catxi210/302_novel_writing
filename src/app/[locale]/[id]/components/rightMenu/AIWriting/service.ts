'use server'

import { createAI302 } from '@302ai/ai-sdk';
import { createStreamableValue } from 'ai/rsc';
import { FinishReason, generateText, streamText, TextStreamPart } from 'ai';
import { advanceRolePrompt, extractRolesPrompt, generateFragmentedPlotPrompt, generateNovelprompt, generateTitlePrompt, prompt1 } from './prompt';

const baseURL = process.env.NEXT_PUBLIC_API_URL

interface IParams {
  apiKey: string;
  modelName: string;
}

interface IFrom {
  synopsis: string;
  synopsisCustomize: string;
  backgroundStory: string;
  writingStyle: string;
  writingStyleCustomize: string;
  fragmentedPlot: string;
  writingRequirements: string;
  previousClip: string;
  previousClipCustomize: string;
  characterRelationships: string;
  introduction: string;
  chapterCount: number;
  chapterOrder: number;
}

interface ICharacter {
  id?: number;
  name: string;
  content: string;
  parentId: number;
  labelColor: string;
}

type AsyncIterableStream<T> = AsyncIterable<T> & ReadableStream<T>;

export const generateNovel = async (params: IParams & { form: IFrom, lang: string, generateQuantity: boolean, titles: string }) => {
  const { apiKey, modelName, form, lang, titles, generateQuantity } = params;

  const stream = createStreamableValue<{
    type: string,
    textDelta?: string,
    data?: { title: string, content: string, index: number }
    logprobs?: FinishReason,
  }>({ type: 'text-delta', textDelta: '' })

  try {
    let previousStorySummary = '';
    let previousSegmentContent = '';

    // 如果synopsis选择章节就使用AI来调整
    if (form.synopsis !== 'customize') {
      const result = await generateSummary({ ...params, content: form.synopsisCustomize });
      if (result?.error) {
        stream.error({ message: { ...result } });
      } else if (result.data) {
        previousStorySummary = result.data;
      }
    } else {
      previousStorySummary = form.synopsisCustomize;
    }

    // 如果previousClip选择章节就裁剪文字最后1300字来作为前一片段
    if (form.previousClip !== 'customize') {
      previousSegmentContent = form.previousClipCustomize.slice(-1300);
    } else {
      previousSegmentContent = form.previousClipCustomize;
    }

    // 1. 根据片段剧情生成统一标题
    const resultTitle = await generateTitle({ ...params, content: form.fragmentedPlot, titles });
    console.log('===========>>>resultTitle', resultTitle);

    if (resultTitle?.data) {
      stream.update({ type: 'title-delta', textDelta: resultTitle.data })
    } else if (resultTitle?.error) {
      stream.error({ message: { ...resultTitle } });
    }

    let content = `
      写作风格: ${form.writingStyleCustomize}\n
      片段剧情: ${form.fragmentedPlot},\n
      写作要求: ${form.writingRequirements},\n
      故事背景和人物关系: ${form.backgroundStory}\n${form.characterRelationships},\n
      故事前情概要: ${previousStorySummary},\n
      前一片段: ${previousSegmentContent},\n
    `

    if (generateQuantity) {
      content += `
        总章节数量：${form.chapterCount},\n
        当前章节序号：${form.chapterOrder},\n
      `
    }

    // 2.生成文章
    const model = createAI302({ apiKey, baseURL });
    (async () => {
      try {
        const { fullStream } = streamText({
          model: model.chatModel(modelName),
          messages: [
            { role: 'system', content: generateNovelprompt[lang] },
            { role: 'user', content }
          ],
        });
        let text = '';
        const onGetResult = async (fullStream: AsyncIterableStream<TextStreamPart<any>>) => {
          for await (const chunk of fullStream) {
            if (chunk.type === 'text-delta') {
              text += chunk.textDelta;
              stream.update({ type: 'text-delta', textDelta: text })
            } else if (chunk.type === 'step-finish') {
              const contentPlanning = await generateFragmentedPlot({ ...params, lang, text, form, previousStorySummary });
              if (contentPlanning.data) {
                stream.update({ type: 'contentPlanning', textDelta: contentPlanning.data })
              }
            } else if (chunk.type === 'finish') {
              stream.update({ type: 'logprobs', logprobs: chunk.finishReason })
            } else if (chunk.type === 'error') {
              try {
                // @ts-ignore
                if (chunk?.error?.responseBody) {
                  // @ts-ignore
                  const errorData = JSON.parse(chunk?.error?.responseBody);
                  stream.error({ message: { ...errorData } });
                }
                stream.error({ message: 'Generation failed' });
              } catch (error) {
                stream.error({ message: 'Generation failed' });
              }
            }
          }
        }
        await onGetResult(fullStream)
        stream.done()
      } catch (error) {
        stream.done()
        stream.error({ message: 'Initialization error' })
      }
    })();
  } catch (error: any) {
    try {
      if (error.responseBody) {
        const errorData = JSON.parse(error.responseBody);
        stream.error({ message: { ...errorData } });
      } else {
        stream.error({ message: 'Generation failed' });
      }
    } catch (error) {
      stream.error({ message: 'Generation failed' });
    }
  }
  return { output: stream.value }
}

export const generateSummary = async (params: IParams & { content: string }) => {
  const { apiKey, modelName, content } = params;

  try {
    const model = createAI302({ apiKey, baseURL });
    const { text } = await generateText({
      model: model.chatModel(modelName),
      messages: [
        { role: 'system', content: prompt1 },
        { role: 'user', content }
      ]
    });

    return { data: text };

  } catch (error: any) {
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

export const generateTitle = async (params: IParams & { content: string, lang: string, titles: string }) => {
  const { apiKey, modelName, content, lang, titles } = params;
  const prompt = generateTitlePrompt[lang]
  const txt = `其他标题：${titles}\n\n
              章节内容：${content}`
  try {
    const model = createAI302({ apiKey, baseURL });
    const { text } = await generateText({
      model: model.chatModel(modelName),
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: txt }
      ]
    });
    return { data: text };
  } catch (error: any) {
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

export const generateFragmentedPlot = async (params: IParams & { lang: string, form: IFrom, generateQuantity: boolean, previousStorySummary: string; text: string, isSynopsis?: boolean, }) => {
  const { apiKey, modelName, isSynopsis, form, text, lang, generateQuantity, previousStorySummary } = params;
  let previousStory = '';
  if (isSynopsis) {
    const result = await generateSummary({ ...params, content: previousStorySummary });
    if (result?.error) {
      return result;
    } else if (result.data) {
      previousStory = result.data;
    }
  } else {
    previousStory = previousStorySummary;
  }


  let content = `
  小说简介：${form.introduction}\n
  故事背景：${form.backgroundStory}\n
  人物角色：${form.characterRelationships}\n
  `
  if (!isSynopsis || !generateQuantity || (isSynopsis && generateQuantity && form.chapterOrder > 1)) {
    content += `
    上一章正文：${text}\n
    前情概要：${previousStory}\n`;
  }

  if ((!isSynopsis && generateQuantity) || (isSynopsis && generateQuantity && form.chapterOrder > 1)) {
    let chapterOrder = form.chapterOrder;
    if (!isSynopsis && generateQuantity) {
      chapterOrder++
    }
    content += `
    总章节数：${form.chapterCount}\n
    当前章节序号：${chapterOrder}\n
    `
  }

  console.log('============>>>>', content);

  try {
    const model = createAI302({ apiKey, baseURL });
    const { text } = await generateText({
      model: model.chatModel(modelName),
      messages: [
        { role: 'system', content: generateFragmentedPlotPrompt[lang] },
        { role: 'user', content }
      ]
    });

    return { data: text };

  } catch (error: any) {
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

export const advanceRole = async (params: IParams & { content: string, list: ICharacter[] }) => {
  const { apiKey, modelName, content, list } = params;

  const userContent = `
      <input>
      <existing_characters>${list.map(item => item.name).join('、')}</existing_characters>
      <existing_descriptions>
      ${list.map(item => `${item.name}：${item.content}`).join('\n\n')
    }
      </existing_descriptions>
      <chapter_content>
      ${content}
      </chapter_content>
    </input>
  `
  try {
    const model = createAI302({ apiKey, baseURL });
    const { text } = await generateText({
      model: model.chatModel(modelName),
      messages: [
        { role: 'system', content: advanceRolePrompt },
        { role: 'user', content: userContent }
      ]
    });

    return { data: text };

  } catch (error: any) {
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

export const extractRoles = async (params: IParams & { content: string, lang: string }) => {
  const { apiKey, modelName, content, lang } = params;
  try {
    const model = createAI302({ apiKey, baseURL });
    const { text } = await generateText({
      model: model.chatModel(modelName),
      messages: [
        { role: 'system', content: extractRolesPrompt[lang] },
        { role: 'user', content }
      ]
    });
    return { data: text };
  } catch (error: any) {
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
