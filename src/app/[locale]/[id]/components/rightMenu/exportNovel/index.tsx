import JSZip from 'jszip';
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { catalogueConfigAtom, userConfigAtom } from "@/stores";
import { useMonitorMessage } from "@/hooks/global/use-monitor-message";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export const ExportNovel = () => {
  const t = useTranslations('exportNovel');
  const { handleDownload } = useMonitorMessage()
  const { id: parentId }: { id: string } = useParams();

  const [{ moreSettingData, bookName }] = useAtom(userConfigAtom);
  const [{ chapterData, currentChapterIds }] = useAtom(catalogueConfigAtom);
  const [selectList, setSelectList] = useState<number[]>([]);

  const onButDisabled = (type: 'all' | 'part') => {
    if (type === 'all') {
      return chapterData.length < 1;
    } else {
      return !currentChapterIds[parentId];
    }
  }

  const onProcessingText = (txt: string) => {
    return txt.split('\n').map((paragraph, index) => {
      if (moreSettingData.enableFirstLineIndent) {
        return `\t${paragraph}`;
      } else if (moreSettingData?.enableParagraphSpacing) {
        return `\n${paragraph}`;
      }
      return paragraph;
    }).join('\n').replace(/\n{2,}/g, '\n\n');
  }

  const exportCurrentChapterTxt = () => {
    const data = chapterData.find(f => f.id === currentChapterIds[parentId])
    if (data) {
      const formattedContent = onProcessingText(data.content);
      const txt = `${data.name}\n\n${formattedContent}`;
      const filename = `《${bookName}》-${data.name}.txt`;
      const blob = new Blob([txt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      handleDownload(url, filename);
    }
  };

  const exportChapterTxt = (type: 'all' | 'part') => {
    let txt = `《${bookName}》`;
    if (type === 'all') {
      chapterData.forEach((item, index) => {
        const formattedContent = onProcessingText(item.content);
        txt += `\n\n\n${item.name}\n\n${formattedContent}`;
      })
    } else if (type === 'part') {
      const data = chapterData.filter(f => selectList.indexOf(f.id!) > -1)
      data.forEach((item, index) => {
        const formattedContent = onProcessingText(item.content);
        txt += `\n${item.name}\n\n${formattedContent}`;
      })
    }
    const filename = `《${bookName}》.txt`
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    handleDownload(url, filename)
  }

  const exportChaptersZip = async (type: 'all' | 'part') => {
    const zip = new JSZip();
    const filename = `《${bookName}》.zip`;
    if (type === 'all') {
      chapterData.forEach((item, index) => {
        const formattedContent = onProcessingText(item.content);
        const txtContent = `${item.name}\n\n${formattedContent}`;
        const txtName = `${item.name}.txt`;
        zip.file(txtName, txtContent);
      })
    } else if (type === 'part') {
      const data = chapterData.filter(f => selectList.indexOf(f.id!) > -1)
      data.forEach((item, index) => {
        const formattedContent = onProcessingText(item.content);
        const txtContent = `${item.name}\n\n${formattedContent}`;
        const txtName = `${item.name}.txt`;
        zip.file(txtName, txtContent);
      })
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    handleDownload(url, filename)
  };

  const renderingSelect = () => {
    return chapterData?.map(item => (
      <DropdownMenuItem key={item.id} className='mb-3' >
        <div className="flex items-center justify-between w-full gap-2" onClick={(e) => e.stopPropagation()}>
          <label htmlFor={`${item.id}`} className='w-full'  >
            {item.name}
          </label>
          <Checkbox id={`${item.id}`}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectList((v) => ([...v, item.id!]))
              } else {
                setSelectList((v) => v.filter(id => id != item.id))
              }
            }}
            checked={selectList.includes(item.id!)}
          />
        </div>
      </DropdownMenuItem>
    ))
  }

  useEffect(() => {
    return () => setSelectList([])
  }, [])

  return (
    <div className="flex flex-col gap-7 w-full p-5">
      <h3 className="text-lg">{t('title')}</h3>
      <div className="flex flex-col gap-7 overflow-y-auto h-[calc(100vh-352px)]">
        <div className="flex flex-col gap-3">
          <div>{t('currentChapter')}</div>
          <Button disabled={onButDisabled('part')} onClick={exportCurrentChapterTxt}>{t('exportCurrentChapterTxt')}</Button>
        </div>

        <div className="flex flex-col gap-3">
          <div>{t('allChapters')}</div>
          <Button className='whitespace-normal break-words' disabled={onButDisabled('all')} onClick={() => exportChaptersZip('all')}>{t('exportAllChaptersZip')}</Button>
          <Button className='whitespace-normal break-words' disabled={onButDisabled('all')} onClick={() => exportChapterTxt('all')}>{t('mergeExportAllChaptersTxt')}</Button>
        </div>

        <div className="flex flex-col gap-3">
          <div>{t('partialChapters')}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {t('selectedChapters', { count: selectList?.length || 0 })}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[360px] max-h-[40vh] overflow-y-auto">
              <DropdownMenuGroup>
                {renderingSelect()}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className='whitespace-normal break-words' disabled={!selectList.length} onClick={() => exportChaptersZip('part')}>{t('exportSelectedChaptersZip')}</Button>
          <Button className='whitespace-normal break-words' disabled={!selectList.length} onClick={() => exportChapterTxt('part')}>{t('mergeExportSelectedChaptersTxt')}</Button>
        </div>
      </div>
    </div>
  )
}
