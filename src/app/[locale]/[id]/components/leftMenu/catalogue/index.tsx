import { toast } from "sonner";
import { useAtom } from "jotai";
import { HiStar } from "react-icons/hi2";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PiListBold } from "react-icons/pi";
import { IChapter } from "../../../interface";
import { Input } from "@/components/ui/input";
import { useTool } from "@/hooks/global/use-tool";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useEffect, useMemo, useRef, useState } from "react";
import { catalogueConfigAtom, userConfigAtom } from "@/stores";
import { addChapter, deleteChapters, updateChapter } from "./indexDB";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const Catalogue = () => {
  const { id: parentId }: { id: string } = useParams();
  const t = useTranslations('catalogue');
  const { formatTimeDiff, countWords } = useTool();

  const [{ moreSettingData, writingForm }, setUserAtom] = useAtom(userConfigAtom);
  const [{ chapterData, currentChapter, currentChapterIds }, setChapterAtom] = useAtom(catalogueConfigAtom);

  const newInputRef = useRef<HTMLInputElement>(null);
  const updateInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const form = writingForm[parentId];

  const [delData, setDelData] = useState<{ open: boolean, id: number[] }>({ open: false, id: [] })
  const [updateId, setUpdateId] = useState<{ id?: number, name?: string }>({});
  const [action, setAction] = useState<{ isSelect: boolean, selectId: number[] }>({ isSelect: false, selectId: [] });
  const [tempChapter, setTempChapter] = useState<{ value: string, disabled: boolean }>({ value: t('undefined_title'), disabled: false });

  const onAddChapter = () => {
    if (!action.isSelect) {
      setTempChapter((v) => ({ ...v, disabled: true }));
      return;
    }
    if (action.selectId.length) {
      setDelData({ open: true, id: action.selectId })
    }
  }

  const handleUpdate = () => {
    if (updateId?.id) {
      updateChapter(updateId?.id, { name: updateId.name }).then(res => {
        setChapterAtom((v) => ({ ...v, chapterData: res, currentChapter: { ...v.currentChapter, name: updateId.name! } }))
      }).catch((error) => {
        console.log(error);
        toast.warning(t('update_error'))
      })
    } else {
      const value: IChapter = {
        content: '',
        updatedAt: '',
        parentId: +parentId,
        name: tempChapter.value,
      }
      addChapter({ ...value }).then(res => {
        const newData = res[res.length - 1];
        setChapterAtom((v) => ({
          ...v,
          chapterData: res,
          currentChapter: newData,
          currentChapterIds: { ...v.currentChapterIds, [parentId]: newData.id! }
        }));
        onSaveWritingForm([newData.id!], res)
      }).catch(() => {
        toast.warning(t('new_chapter_error'))
      })
    }
    resetUpdateState();
  };

  const saveUpdateState = () => {
    if ((tempChapter.disabled && tempChapter.value.trim().length) || (updateId?.id && updateId?.name?.trim()?.length)) {
      handleUpdate();
    }
    resetUpdateState();
  }

  const resetUpdateState = () => {
    setTempChapter({ value: t('undefined_title'), disabled: false });
    setUpdateId({});
  };

  const onCheckChapter = (item: IChapter) => {
    setChapterAtom((v) => ({
      ...v,
      currentChapter: item || {} as IChapter,
      currentChapterIds: { ...v.currentChapterIds, [parentId]: item.id! }
    }));
  }

  const onSaveWritingForm = (id: number[], res: IChapter[]) => {
    const lastData = res[res.length - 1];
    let synopsis = form.synopsis;
    let previousClip = form.previousClip;
    if (!lastData?.id) {
      synopsis = 'customize';
      previousClip = 'customize';
    } else {
      if (id.includes(+form.synopsis)) {
        synopsis = `${lastData.id!}`
      }
      if (id.includes(+form.previousClip)) {
        previousClip = `${lastData.id!}`
      }
    }

    setUserAtom((v) => ({
      ...v,
      writingForm: {
        ...v.writingForm,
        [parentId]: {
          ...v.writingForm[parentId],
          synopsis,
          previousClip,
        }
      }
    }))
  }

  const onCheckedChange = (id: number, checked: CheckedState) => {
    if (checked) {
      setAction((v => ({ ...v, selectId: [...v.selectId, id] })))
    } else {
      setAction((v => ({ ...v, selectId: v.selectId.filter(f => f !== id) })))
    }
  }

  const onAction = (type?: 'selectAll' | 'invert' | 'asterisk') => {
    let ids: number[] = [];
    if (!type) {
      setAction((v) => ({ isSelect: !v.isSelect, selectId: [] }));
      return;
    } else if (type === 'selectAll') {
      ids = chapterData.map(item => item.id!);
    } else if (type === 'invert') {
      ids = chapterData.filter(f => !action.selectId.includes(f.id!)).map(item => item.id!)
    }
    setAction((v) => ({ ...v, selectId: ids }));
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if ((tempChapter.disabled && tempChapter.value.trim().length) || (updateId?.id && updateId?.name?.trim()?.length)) {
        handleUpdate();
      } else {
        resetUpdateState();
      }
    } else if (e.key === 'Escape') {
      resetUpdateState();
    }
  };

  const renderingDelete = useMemo(() => {
    const onDeleteData = () => {
      deleteChapters(delData.id, +parentId!).then(res => {
        const newCurrentChapterId = delData.id.includes(currentChapterIds[parentId]) ? 0 : currentChapterIds[parentId];
        setChapterAtom((v) => ({
          ...v,
          chapterData: res,
          currentChapter: newCurrentChapterId ? v.currentChapter : {} as IChapter,
          currentChapterIds: { ...v.currentChapterIds, [parentId]: newCurrentChapterId! }
        }));
        setAction((v) => {
          return {
            ...v,
            selectId: v.selectId.filter(f => !delData.id.includes(f))
          }
        })
        if (delData.id.includes(+form.synopsis) || delData.id.includes(+form.previousClip)) {
          onSaveWritingForm(delData.id, res)
        }
      }).catch(() => {
        toast.error(t('delete_error'))
      })
      setDelData({ open: false, id: [] })
    }

    return (
      <AlertDialog open={delData.open}>
        <AlertDialogTrigger asChild className="text-red-600" >
          {t('delete')}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete_title')}</AlertDialogTitle>
            <AlertDialogDescription />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDelData({ open: false, id: [] })}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteData}>{t('continue')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }, [delData])

  useEffect(() => {
    if (updateId.id && updateInputRef.current) {
      updateInputRef.current.focus();
    }
    if (newInputRef.current && tempChapter) {
      newInputRef.current.focus();
    }
  }, [updateId, tempChapter]);

  useEffect(() => {
    if (currentChapter?.id && currentChapter.id < 0) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }
  }, [currentChapter?.id])

  return (
    <div className="h-full flex flex-col items-center gap-5">

      <div className="flex items-center justify-between w-full px-3 text-sm gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className='cursor-pointer' onClick={() => onAction()}>{action.isSelect ? t('cancel_select') : t('select')}</div>
          {
            action.isSelect && (
              <>
                <div className='cursor-pointer' onClick={() => onAction('selectAll')}>{t('select_all')}</div>
                <div className='cursor-pointer' onClick={() => onAction('invert')}>{t('invert_select')}</div>
              </>
            )
          }
        </div>
        <div className='cursor-pointer min-w-fit' onClick={onAddChapter}>{action.isSelect ? t('delete') : t('new')}</div>
      </div>

      <div className='overflow-y-auto w-full px-2 flex flex-col items-center gap-3 pb-5' ref={scrollContainerRef}>
        {
          chapterData?.map(item => (
            <div
              key={item.id}
              onClick={() => onCheckChapter(item)}
              className={`flex items-center justify-between gap-1 rounded-lg py-2 px-3 cursor-pointer w-full
                  hover:bg-[#7c3aed17] ${currentChapterIds[parentId] === item.id && 'bg-[#7c3aed17]'}`
              }
            >
              <div className="w-[calc(100%-90px)]">
                {
                  updateId?.id === item.id ?
                    <Input
                      ref={updateInputRef}
                      className="w-full no-drag"
                      value={updateId?.name}
                      onKeyDown={handleKeyDown}
                      onBlur={saveUpdateState}
                      onChange={(e) => setUpdateId((v) => ({ ...v, name: e.target.value }))}
                    /> :
                    <p className="text-ellipsis text-nowrap overflow-hidden w-full">{item.name}</p>
                }
                <span className="text-xs text-slate-500">{countWords(item.content, moreSettingData?.ignorePunctuation)}{t('characters')}</span>
              </div>
              {
                updateId?.id !== item.id && (
                  <div className="flex items-center gap-2 max-w-[106px]">
                    <div className="text-xs text-slate-500">{formatTimeDiff(item.updatedAt)}</div>
                    {
                      action.isSelect ?
                        <Checkbox
                          id={`${item.id}`}
                          checked={action.selectId.includes(item.id!)}
                          onCheckedChange={(checked) => onCheckedChange(item.id!, checked)}
                          onClick={(e) => { e.stopPropagation(); }}
                        /> :
                        <DropdownMenu>
                          <DropdownMenuTrigger className='outline-none'>
                            <PiListBold />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            <DropdownMenuItem onClick={() => setUpdateId({ name: item.name, id: item.id! })}>{t('modify')}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setUserAtom((v) => ({ ...v, opneRightMenu: 'exportNovel' }))}>{t('export_chapter')}</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setDelData({ open: true, id: [item.id!] })
                              }}
                            >
                              {t('delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    }
                  </div>
                )
              }
            </div>
          ))
        }

        <div className={`items-center justify-between bg-[#7c3aed17] rounded-lg py-2 px-3 cursor-pointer w-full hidden ${tempChapter.disabled && '!flex'}`}>
          <Input
            ref={newInputRef}
            className="no-drag"
            value={tempChapter.value}
            onKeyDown={handleKeyDown}
            onBlur={saveUpdateState}
            onChange={(e) => setTempChapter((v) => ({ ...v, value: e.target.value }))}
          />
        </div>

        {renderingDelete}

      </div>
    </div>
  )
}
