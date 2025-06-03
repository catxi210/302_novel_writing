import { toast } from "sonner";
import { useAtom } from "jotai";
import { Loader2 } from "lucide-react";
import { generateName } from "./service";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { getNamingData } from "./namingData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorToast } from "@/components/ui/errorToast";
import { appConfigAtom, userConfigAtom } from "@/stores";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea";

interface IProps {
  open: boolean,
  onClose: (open: boolean) => void,
}
export const RandomNaming = (props: IProps) => {
  const { open, onClose } = props
  const t = useTranslations('randomNaming');
  const [{ randomNamingData: data, tempModel }, setUserAtom] = useAtom(userConfigAtom);

  const [isLoad, setIsLoad] = useState(false);
  const [{ apiKey = '', modelName = '' }] = useAtom(appConfigAtom);

  const nationality = [
    { label: t('nationality.chinese'), value: 'zh' },
    { label: t('nationality.english'), value: 'en' },
    { label: t('nationality.japanese'), value: 'ja' },
  ]

  const onGenerateName = async () => {
    try {
      setIsLoad(true)
      const result = await generateName({ ...data, apiKey, modelName: tempModel || modelName })
      if (result?.error) {
        if (result?.error?.err_code) {
          toast(() => (ErrorToast(result.error.err_code)))
        } else {
          toast(t('generateFailed'))
        }
      } else if (result?.data) {
        const names = result.data.split(/[,，]/)
          .filter((name: string) => name !== '')
          .map((name: string) => name.replace(/[^\u4e00-\u9fa5a-zA-Z\s]/g, ''));
        if (names) {
          setUserAtom((v) => ({
            ...v,
            randomNamingData: {
              ...v.randomNamingData,
              list: {
                ...v.randomNamingData.list,
                [data.nationality]: Array.from(new Set(names))
              }
            }
          }));
        }
      } else {
        toast.error(t('generateFailed'))
      }
    } catch (error) {
      toast.error(t('generateFailed'))
    }
    setIsLoad(false)
  }

  const saveData = (name: string, value: any) => {
    setUserAtom((v) => ({ ...v, randomNamingData: { ...v.randomNamingData, [name]: value } }));
  }

  const onOpenChange = (open: boolean) => {
    if (!open && !isLoad) {
      onClose(open);
    }
  }

  const RenderingNames = useMemo(() => {
    let list = data.list[data.nationality];
    if (!list.length) {
      list = getNamingData(data.nationality);
    }
    const getRandomNames = () => {
      const shuffled = [...list].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 24);
    }

    const onCopyCharacter = async (name: string) => {
      try {
        await navigator.clipboard.writeText(name);
        toast.success(t('copy_success'))
      } catch (err) {
        toast.error(t('copy_error'))
      }
    };

    return (
      <div className="flex gap-[20px] flex-wrap content-start border rounded-lg p-3 h-[476px] overflow-y-auto col-span-3">
        {getRandomNames().map(name => (
          <div
            key={name}
            onClick={() => onCopyCharacter(name)}
            className={`min-w-[120px] px-5 text-center py-2 cursor-pointer rounded-md no-drag bg-[#ececec] text-black`}
          >
            {name}
          </div>
        ))}
      </div>
    )
  }, [data.list, data.nationality, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild />
      <DialogContent className="md:max-w-[800px] w-screen">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className='grid grid-cols-5 gap-5'>
          <div className="flex flex-col gap-5 min-w-1/2 col-span-2">
            <div className="flex flex-col gap-2">
              <div>{t('nationality.label')}</div>
              <div className="flex items-center content-start flex-wrap gap-5">
                {
                  nationality.map(item => (
                    <Button
                      key={item.value}
                      onClick={() => saveData('nationality', item.value)}
                      variant={data.nationality === item.value ? 'default' : 'outline'}
                    >
                      {item.label}
                    </Button>
                  ))
                }
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div>{t('userRequest')}</div>
              <div className="flex items-center gap-5">
                <Textarea
                  value={data.userRequire}
                  className="min-h-[100px] no-drag"
                  placeholder={t('userRequest_pla')}
                  onChange={(e) => {
                    saveData('userRequire', e.target.value)
                  }}
                />
              </div>
            </div>

            <Button onClick={onGenerateName} disabled={isLoad}>
              {t('generate')}
              {isLoad && <Loader2 className="h-[20px] w-[20px] animate-spin" />}
            </Button>

          </div>
          {RenderingNames}
        </div>
      </DialogContent>
    </Dialog>
  )
}
