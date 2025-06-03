import { toast } from "sonner";
import { Rnd } from "react-rnd";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { Link } from "@/i18n/routing";
import { useTheme } from "next-themes";
import { Catalogue } from "./catalogue";
import { IChapter } from "../../interface";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BiChevronLeftCircle } from "react-icons/bi";
import AppFooter from "@/components/global/app-footer";
import { catalogueConfigAtom, userConfigAtom } from "@/stores";
import { addChapter, getChapterListByParentId } from "./catalogue/indexDB";

export const LeftMenu = (props: { onResize: (width: number) => void }) => {
  const t = useTranslations();
  const { theme } = useTheme();
  const { id: parentId }: { id: string } = useParams();

  const [{ bookName, themeData }] = useAtom(userConfigAtom);
  const [{ currentChapterIds }, setChapterAtom] = useAtom(catalogueConfigAtom);
  const [{ }, setUserAtom] = useAtom(userConfigAtom);

  // 获取章节数据
  useEffect(() => {
    if (parentId) {
      getChapterListByParentId(+parentId).then(res => {
        if (!res.length) {
          const value: IChapter = {
            content: '',
            updatedAt: '',
            parentId: +parentId,
            name: t('catalogue.undefined_title'),
          }
          addChapter({ ...value }).then(res => {
            const newData = res[res.length - 1];
            setChapterAtom((v) => ({
              ...v,
              chapterData: res,
              currentChapter: newData,
              currentChapterIds: { ...v.currentChapterIds, [parentId]: newData.id! }
            }));
            setUserAtom((v) => {
              return {
                ...v,
                writingForm: {
                  ...v.writingForm,
                  [parentId]: {
                    ...v.writingForm[parentId],
                    synopsis: `${newData?.id || 'customize'}`,
                    previousClip: `${newData?.id || 'customize'}`,
                  }
                }
              }
            })
          }).catch(() => {
            toast.warning(t('new_chapter_error'))
          })
        } else {
          const data = res?.find(f => f.id === currentChapterIds?.[parentId] || 0);
          if (data) {
            setChapterAtom((v) => ({ ...v, chapterData: res, currentChapter: data }))
          } else {
            setChapterAtom((v) => ({
              ...v,
              chapterData: res || [],
              currentChapter: {} as IChapter,
              currentChapterIds: { ...v.currentChapterIds, [parentId]: 0 },
            }))
          }
        }
      })
    }
  }, [parentId])

  return (
    <Rnd
      style={{ backgroundColor: `rgba(${theme === 'dark' ? '0,0,0' : '255,255,255'},${themeData.sidebarTransparency})` }}
      className="!static border-r h-full !cursor-default !translate-x-0 !translate-y-0"
      default={{
        x: 0,
        y: 0,
        width: 270,
        height: '100%',
      }}
      position={{ x: 0, y: 0 }}
      maxWidth={500}
      minWidth={270}
      enableResizing={{ right: true }}
      dragAxis={'none'}
      cancel=".no-drag"
      onResize={(e, dir, elementRef, delta) => {
        props.onResize(delta.width)
      }}
    >
      <Link href='/' className='cursor-pointer flex items-center gap-1 pt-3 px-3 text-sm text-[#8e47f0] w-fit'>
        <BiChevronLeftCircle className="text-lg" />{t('home.return_to_bookshelf')}
      </Link>

      <div className="flex items-center justify-center relative p-3">
        <h3 className="text-center w-full font-bold">《{bookName}》</h3>
      </div>

      <div className="h-[calc(100%-131px)]" >
        <Catalogue />
      </div>

      <div>
        <AppFooter />
      </div>

    </Rnd>
  )
}
