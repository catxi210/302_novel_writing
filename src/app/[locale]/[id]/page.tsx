"use client"

import { toast } from "sonner";
import { useAtom } from "jotai";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LeftMenu } from "./components/leftMenu";
import { useTool } from "@/hooks/global/use-tool";
import { RightMenu } from "./components/rightMenu";
import { useLocale, useTranslations } from "next-intl";
import { ErrorToast } from "@/components/ui/errorToast";
import { CSSProperties, useEffect, useState } from "react";
import { ChapterEditor } from "./components/chapterEditor";
import { RenderingNotData } from "./components/renderingNotData";
import { generateTitle } from "./components/rightMenu/AIWriting/service";
import { useStatistics } from "./components/rightMenu/wordCount/statistics";
import { appConfigAtom, catalogueConfigAtom, userConfigAtom } from "@/stores";
import { getChapterListByParentId, updateChapter } from "./components/leftMenu/catalogue/indexDB";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function NovelEditor() {
  useStatistics()
  const locale = useLocale();
  const t = useTranslations();
  const { theme } = useTheme();
  const { formatTimeDiff, countWords } = useTool()
  const { id: parentId }: { id: string } = useParams();

  const [{ apiKey = '', modelName = '' }] = useAtom(appConfigAtom);
  const [{ chapterData, currentChapterIds, currentChapter }, setCatalogueAtom] = useAtom(catalogueConfigAtom);
  const [{ moreSettingData, themeData, tempModel, bookName }, setUserAtom] = useAtom(userConfigAtom);

  const [setyls, setStyles] = useState<CSSProperties>({});

  const [isAutomaticTitle, setIsAutomaticTitle] = useState(false);

  useEffect(() => {
    setUserAtom((v) => ({
      ...v,
      typing: false,
      undo: false,
      redo: false,
      isFreeTime: false,
      typingTime: 0,
      freeTime: 0,
      typingLength: 0,
      tempModel:''
    }));
  }, [])

  useEffect(() => {
    const { pathname, search } = window.location;
    window.localStorage.setItem('route', `/${pathname.split('/')[2]}${search}`)
  }, [])

  useEffect(() => {
    const stylesTemp: CSSProperties = {}
    if (themeData.paperType === 'none') {
      stylesTemp.backgroundImage = 'unset'
    } else if (themeData.backgroundImage && themeData.paperType === 'back') {
      stylesTemp.backgroundImage = `url(${themeData.backgroundImage})`
      stylesTemp.backgroundBlendMode = 'unset';
    } else if (themeData.paper && themeData.paperType === 'paper') {
      stylesTemp.backgroundImage = `url(${themeData.paper})`;
      stylesTemp.backgroundBlendMode = 'luminosity';
    }
    stylesTemp.backgroundColor = themeData.themeColor;
    stylesTemp.backgroundPositionY = '-48px';

    setStyles((v) => ({
      ...v,
      ...stylesTemp
    }))
  }, [themeData])

  const onSwitchChapters = (type: 'next' | 'prev') => {
    let index = chapterData.findIndex(f => f.id === currentChapterIds[parentId])
    if (index > -1) {
      index = type === 'prev' ? index - 1 : index + 1;
      const id = chapterData[index].id;
      if (parentId) {
        getChapterListByParentId(+parentId).then(res => {
          setCatalogueAtom((v) => ({
            ...v,
            chapterData: res,
            currentChapter: res[index],
            currentChapterIds: { ...v.currentChapterIds, [parentId]: id! }
          }));
        })
      }
    }
  }

  const butDisabled = (type: 'next' | 'prev') => {
    if (!currentChapterIds[parentId]) {
      return true
    } else if (chapterData.length === 1) {
      return true;
    } else if (type === 'next') {
      const index = chapterData.findIndex(f => f.id === currentChapterIds[parentId]) + 1;
      if (index === chapterData.length) {
        return true;
      }
    } else if (type === 'prev') {
      return chapterData.findIndex(f => f.id === currentChapterIds[parentId]) < 1
    }
    return false;
  }

  const onGetFormatTimeDiff = () => {
    const temp = chapterData.find(f => f.id === currentChapterIds[parentId])

    if (temp && temp.updatedAt) {
      return formatTimeDiff(temp.updatedAt)
    }
    return '';
  }

  const renderingBottom = () => {
    const wordCount = () => {
      return countWords(chapterData.find(f => f.id === currentChapterIds[parentId])?.content || '', moreSettingData?.ignorePunctuation)
    }

    const onAutomaticTitle = async () => {
      try {
        setIsAutomaticTitle(true)
        const titles = chapterData.map(item => item.name).join('、')
        const result = await generateTitle({
          titles,
          apiKey,
          lang: locale,
          modelName: tempModel || modelName,
          content: currentChapter?.content || ''
        });
        if (result?.data) {
          updateChapter(currentChapter.id!, { name: result.data }).then(res => {
            setCatalogueAtom((v) => ({ ...v, chapterData: res, currentChapter: { ...v.currentChapter, name: result.data } }))
          }).catch((error) => {
            toast(t('generateTitleFailed'))
          })
        } else if (result?.error) {
          if (result?.error?.err_code) {
            toast(() => (ErrorToast(result.error.err_code)))
          } else {
            toast(t('generateTitleFailed'))
          }
        }
      } catch (error) {
        toast(t('generateTitleFailed'))
      }
      setIsAutomaticTitle(false)
    }

    return (
      <div
        style={{
          backgroundColor: `rgba(${theme === 'dark' ? '0,0,0' : '255,255,255'},${themeData.sidebarTransparency})`
        }}
        className="border-t p-3 flex items-center justify-between text-sm  max-h-[45px]"
      >
        <div className="text-xs text-slate-500">{t('Last_Modified')}：{onGetFormatTimeDiff()}</div>
        <div className="flex items-center gap-4">

          <div className="flex items-center gap-1">
            <button disabled={butDisabled('prev')} className={`${butDisabled('prev') && 'text-slate-500'}`} onClick={() => onSwitchChapters('prev')}>{t('prev')}</button>
            <span className="text-[#8e47f0]">/</span>
            <button disabled={butDisabled('next')} className={`${butDisabled('next') && 'text-slate-500'}`} onClick={() => onSwitchChapters('next')}>{t('next')}</button>
          </div>

          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  className="text-[#8e47f0] p-0"
                  disabled={isAutomaticTitle || !currentChapter?.content}
                  onClick={onAutomaticTitle}
                >
                  {t('automaticTitle')}
                  {isAutomaticTitle && <Loader2 className="h-[20px] w-[20px] animate-spin" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[250px]">{t('automaticTitle_pla')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

        </div>
        <div className="text-xs">
          {t('CurrentWordCount')}：{wordCount()}
        </div>
      </div>
    )
  }

  const saveChapterName = () => {
    if (!currentChapter?.name?.trim()?.length) {
      const data = chapterData.find(f => f.id === currentChapterIds[parentId]);
      if (data) {
        setCatalogueAtom((v) => ({ ...v, currentChapter: { ...data } }))
      }
      return;
    }
    updateChapter(currentChapterIds[parentId], { name: currentChapter.name }).then(res => {
      setCatalogueAtom((v) => ({ ...v, chapterData: res }))
    }).catch((error) => {
      const data = chapterData.find(f => f.id === currentChapterIds[parentId]);
      if (data) {
        setCatalogueAtom((v) => ({ ...v, currentChapter: { ...data } }))
      }
      toast.warning(t('update_error'))
    })
  }

  const resetUpdateState = () => {
    saveChapterName();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveChapterName();
    }
  };

  const [leftMenuWith, setLeftMenuWith] = useState(0)
  return (
    <div style={setyls} className="w-screen mx-auto h-screen overflow-hidden">
      <div className="w-full h-full overflow-hidden flex">
        <LeftMenu onResize={setLeftMenuWith} />
        <div className="h-full flex flex-col" style={{ width: `calc(100% - ${leftMenuWith + 270}px)` }}>
          <div className="border-b px-10 h-[41px]" style={{ backgroundColor: `rgba(${theme === 'dark' ? '0,0,0' : '255,255,255'},${themeData.sidebarTransparency})` }}>
            <Input
              value={currentChapter?.name || ''}
              onKeyDown={handleKeyDown}
              onBlur={resetUpdateState}
              className='border-0 shadow-none !ring-0 h-[41px]'
              onChange={(e) => setCatalogueAtom((v) => ({ ...v, currentChapter: { ...v.currentChapter, name: e.target.value } }))}
            />
          </div>
          <div className="flex flex-col justify-between h-full">
            <div className="grid grid-cols-[99999999999fr_1fr] h-full w-full justify-items-end">
              <div className="overflow-auto w-full">
                <ChapterEditor />
              </div>
              <div className="min-w-fit" >
                <RightMenu />
              </div>
            </div>
            {renderingBottom()}
          </div>
        </div>
      </div>
      <RenderingNotData />
    </div>
  )
}
