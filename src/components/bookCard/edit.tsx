import { toast } from 'sonner';
import { useAtom } from 'jotai';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import CropperImage from "../Cropper";
import { Loader2 } from 'lucide-react';
import { IBookCard } from './interface';
import { Textarea } from '../ui/textarea';
import { aiGenerateImage } from './service';
import { useTranslations } from "next-intl";
import { ErrorToast } from '../ui/errorToast';
import { addData, updateData } from "./indexDB";
import { TiDeleteOutline } from "react-icons/ti";
import { AiOutlinePicture } from "react-icons/ai";
import { appConfigAtom, userConfigAtom } from '@/stores';
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Iprops {
  open: boolean;
  action: 'add' | 'edit';
  onClose: (open: boolean) => void;
  modifyRecord: IBookCard | null;
}

const initialData = {
  name: '',
  author: '',
  introduction: '',
  backcloth: '/images/global/default Cover.png'
}

export const EditBookCard = (props: Iprops) => {
  const t = useTranslations();
  const [{ apiKey }] = useAtom(appConfigAtom);
  const [_, setUserAtom] = useAtom(userConfigAtom);
  const { open, action, onClose, modifyRecord } = props;

  const [image, setImage] = useState('')
  const [data, setData] = useState(initialData)
  const [isAILoad, setIsAILoad] = useState(false)
  const [openCropper, setOpenCropper] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async () => {
    if (!data?.introduction?.trim().length) {
      toast.warning(t('bookCard.introduction_warning'))
      return;
    }
    if (!data?.name?.trim().length) {
      toast.warning(t('bookCard.name_warning'))
      return;
    }
    if (!data?.author?.trim().length) {
      toast.warning(t('bookCard.author_warning'))
      return;
    }
    try {
      if (action === 'add') {
        addData({ ...data }).then(res => {
          setUserAtom((v) => ({ ...v, bookshelf: res }));
          onClose(false);
        }).catch(() => {
          toast.error(t('bookCard.addError'))
        })
      } else {
        updateData(modifyRecord?.id!, { ...data }).then(res => {
          setUserAtom((v) => ({ ...v, bookshelf: res }));
          onClose(false);
        }).catch(() => {
          toast.error(t('bookCard.editError'))
        })
      }
    } catch (error) {
      toast.error(t('bookCard.operationError'))
    }
  }

  const onClickHandleFile = () => {
    if (fileInputRef?.current) {
      fileInputRef.current?.click();
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.length) {
      const files = e.target.files;
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as any);
      };
      reader.readAsDataURL(files[0]);
      setOpenCropper(true);
    }
  };

  const onSaveData = (type: 'name' | 'author' | 'backcloth' | 'chapterCount' | 'introduction', value: string) => {
    setData((v) => ({ ...v, [type]: value }))
  }

  const onAiGenerate = async () => {
    setIsAILoad(true)
    const result = await aiGenerateImage({ apiKey: apiKey!, bookName: data.name });
    if (result?.error) {
      if (result?.error?.err_code) {
        toast(() => (ErrorToast(result?.error?.err_code)))
      } else {
        toast.error(t('generation_failed'))
      }
    } else if (result?.src) {
      setImage(result.src);
      setOpenCropper(true);
    }
    setIsAILoad(false)
  }

  useEffect(() => {
    if (open) {
      if (modifyRecord?.id) {
        setData(() => ({ ...modifyRecord }))
      } else {
        setData({ ...initialData })
      }
    }
  }, [open])

  return (
    <AlertDialog open={open}>
      <AlertDialogTrigger asChild />
      <AlertDialogContent className='w-[600px]'>
        <AlertDialogHeader>
          <AlertDialogTitle >{action === 'add' ? t('add_des') : t('edit_des')}</AlertDialogTitle>
          <AlertDialogDescription />
        </AlertDialogHeader>
        <div className='flex flex-col gap-5'>
          <div className="flex items-center justify-between gap-5">
            <div className="flex flex-col items-center justify-center gap-5 relative">
              {
                data.backcloth && (
                  <div className='absolute right-0 top-0 cursor-pointer rounded-lg' onClick={() => onSaveData('backcloth', '')}>
                    <TiDeleteOutline className="text-2xl text-red-600" />
                  </div>
                )
              }
              <input type="file" ref={fileInputRef} accept=".png,.jpg,.jpeg" onChange={handleFileChange} style={{ display: 'none' }} />
              <div className="border-2 rounded-lg border-dashed flex flex-col items-center justify-center gap-4 h-[200px] w-[160px] text-slate-500 cursor-pointer" onClick={onClickHandleFile}>
                {
                  data?.backcloth ?
                    <img src={data.backcloth} className="h-full" /> :
                    <>
                      <AiOutlinePicture className="text-[40px]" />
                      <p>{t('bookCard.addCover')}</p>
                    </>
                }
              </div>
              <Button disabled={!data.name || isAILoad} onClick={onAiGenerate}>
                {t('bookCard.aiCover')}
                {isAILoad && <Loader2 className="w-[20px] h-[20px] animate-spin" />}
              </Button>
            </div>
            <div className="pb-16">
              <div className="border-b p-3 flex items-center gap-1">
                <div className="min-w-fit">{t('bookCard.bookName')}：</div>
                <Input
                  placeholder={t('bookCard.enterBookName')}
                  className="border-none p-0 shadow-none !ring-0"
                  value={data.name}
                  onChange={(e) => onSaveData('name', e.target.value)}
                />
              </div>
              <div className="border-b p-3 flex items-center gap-1">
                <div className="min-w-fit">{t('bookCard.author')}：</div>
                <Input
                  placeholder={t('bookCard.enterAuthorName')}
                  className="border-none p-0 shadow-none !ring-0"
                  value={data.author}
                  onChange={(e) => onSaveData('author', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="p-3 flex flex-col gap-1">
            <div className="min-w-fit">{t('bookCard.introduction')}：</div>
            <Textarea
              placeholder={t('bookCard.enterIntroduction')}
              className='min-h-[100px]'
              value={data.introduction}
              onChange={(e) => onSaveData('introduction', e.target.value)}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onClose(false)}>{t('bookCard.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit}>{t('bookCard.continue')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
      <CropperImage
        src={image}
        open={openCropper}
        onClose={() => {
          setImage('')
          setOpenCropper(false);
          if (fileInputRef?.current) {
            fileInputRef.current.value = ''
          }
        }}
        onOk={(src) => onSaveData('backcloth', src)}
      />
    </AlertDialog>
  )
}
