"use client";

import { useAtom } from "jotai";
import { CSSProperties, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { RiAddLargeFill } from "react-icons/ri";
import { BookCard } from "@/components/bookCard";
import { appConfigAtom, userConfigAtom } from "@/stores";
import { EditBookCard } from "@/components/bookCard/edit";
import { getAllList } from "@/components/bookCard/indexDB";
import { IBookCard } from "@/components/bookCard/interface";

export default function Home() {
  const t = useTranslations();

  const [{ hideBrand }] = useAtom(appConfigAtom);
  const [{ bookshelf, themeData }, setUserAtom] = useAtom(userConfigAtom);

  const [open, setOpen] = useState(false);

  const [action, setAction] = useState<'add' | 'edit'>('add')
  const [modifyRecord, setModifyRecord] = useState<IBookCard | null>(null)

  const onOpenEdit = (type: 'add' | 'edit') => {
    setOpen(true)
    setAction(type)
  }

  useEffect(() => {
    getAllList().then(res => (
      setUserAtom((v) => ({ ...v, bookshelf: res, currentTab: 1, settingTab: { tab: 1, character: '', inspiration: '' } }))
    ))
  }, [])

  useEffect(() => {
    window.localStorage.removeItem('route');
  }, [])

  return (
    <div className="text-2xl lg:w-[1240px] lg:px-5 w-full mx-auto max-h-[calc(100vh-52px)] overflow-hidden">
      <div className='h-20 w-full flex items-center justify-center gap-5 py-3'>
        {!hideBrand && <img src="/images/global/logo-mini.png" className='h-full' />}
        <h2 className='text-[26px] font-bold'>{t('home.title')}</h2>
      </div>
      <div className="p-10 text-sm border bg-background h-[calc(100vh-132px)] overflow-y-auto rounded-lg">
        <div className="flex flex-wrap gap-14">
          {bookshelf?.map(item => (
            <BookCard
              book={item}
              key={item?.id}
              onUpdate={() => {
                setModifyRecord(item);
                onOpenEdit('edit');
              }}
            />
          ))}
          <div className="border border-dashed rounded-lg border-[#8e47f0] w-[170px] h-[230px] flex items-center justify-center cursor-pointer" onClick={() => onOpenEdit('add')}>
            <RiAddLargeFill className="text-[50px] text-slate-400" />
          </div>
        </div>
      </div>
      {
        !bookshelf?.length &&
        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-7 text-slate-600'>
          <img src="/images/global/empty.png" className="w-[200px]" alt="" />
          {t('empty')}
        </div>
      }
      <EditBookCard
        open={open}
        action={action}
        onClose={setOpen}
        modifyRecord={modifyRecord}
      />
    </div >
  );
}
