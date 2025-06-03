import dayjs from "dayjs";
import { useAtom } from "jotai";
import { throttle } from 'lodash';
import { IChapter } from "../../interface";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FiFileText } from "react-icons/fi";
import { QuillEditor } from "@/components/quillEditor";
import { updateData } from "@/components/bookCard/indexDB";
import { updateChapter } from "../leftMenu/catalogue/indexDB";
import { catalogueConfigAtom, userConfigAtom } from "@/stores";

export const ChapterEditor = () => {
  const t = useTranslations();
  const { id: parentId }: { id: string } = useParams();
  const [{ layoutData, moreSettingData, fontData, themeData }, setUserAtom] = useAtom(userConfigAtom);
  const [{ chapterData, currentChapter, currentChapterIds }, setCatalogueAtom] = useAtom(catalogueConfigAtom);
  const [tempContent, setTempContent] = useState('');

  const onEditorChange = async (value: string) => {
    console.log(currentChapter.id);

    if (currentChapter?.id && currentChapter.id < 0) return;
    const updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const newData = chapterData.find(f => f.id === currentChapterIds[parentId]);
    if (newData) {
      setCatalogueAtom((v) => ({ ...v, currentChapter: { ...newData, updatedAt, content: value } }))
      throttledUpdateChapter(currentChapterIds[parentId], { ...newData, updatedAt, content: value });
    }
  }

  const throttledUpdateChapter = throttle(async (id, data: IChapter) => {
    await updateChapter(id, data).then(res => {
      setCatalogueAtom((v) => ({ ...v, chapterData: res }))
    })
    await updateData(data.parentId, { updatedAt: data.updatedAt })
  }, 300);

  useEffect(() => {
    if (currentChapter) {
      setTempContent(currentChapter?.content || '')
    }
  }, [currentChapter?.id])

  return (
    <div className="h-full p-5 w-full" >
      <div
        className={` mx-auto rounded-md flex flex-col overflow-hidden gap-3 
          ${themeData.paperType === 'paper' && 'bg-blend-luminosity'} ${!currentChapterIds[parentId] && 'hidden'}`
        }
        style={{ maxWidth: layoutData.editorSize || 800 }}
      >
        <QuillEditor
          onChange={onEditorChange}
          id={currentChapterIds[parentId]}
          value={tempContent || ''}
          className={`h-[calc(100vh-125px)] w-full ${moreSettingData?.enableFirstLineIndent && 'text_indent'} 
                ${!moreSettingData.enableParagraphSpacing && 'p_margin_0'}`}
        />
      </div>
      {
        !currentChapterIds[parentId] &&
        <div className="flex flex-col gap-3 items-center justify-center w-full h-full text-slate-600">
          <FiFileText className="text-[40px]" />
          <div className="text-lg">{t('chapterNotOpened')}</div>
        </div>
      }
    </div>
  )
}
