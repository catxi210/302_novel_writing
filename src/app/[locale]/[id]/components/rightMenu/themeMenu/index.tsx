import { toast } from "sonner";
import { useAtom } from "jotai";
import { useMemo, useRef } from "react";
import { userConfigAtom } from "@/stores";
import { uploadFile } from "@/api/upload";
import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { FaChevronRight } from "react-icons/fa";
import { TiDeleteOutline } from "react-icons/ti";
import { editorTheme } from "@/constants/editorTheme";

export const ThemeMenu = () => {
  const t = useTranslations('themeMenu');

  const { themeColorList, paperList } = editorTheme(t);
  const [{ fontData, themeData }, setUserAtom] = useAtom(userConfigAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const textColorPicker = useMemo(() => {
    const onSaveTextColor = (value: string) => {
      setUserAtom((v) => ({ ...v, fontData: { ...v.fontData, textColor: value } }));
    }
    return (
      <input
        type='color'
        className='cursor-pointer'
        value={fontData.textColor}
        onChange={(e) => onSaveTextColor(e.target.value)}
      />
    )
  }, [fontData?.textColor])

  const backColorPicker = useMemo(() => {
    const onSaveThmeColor = (value: string) => {
      setUserAtom((v) => ({ ...v, themeData: { ...v.themeData, themeColor: value } }));
    }
    return (
      <input
        type='color'
        className='cursor-pointer'
        value={themeData.themeColor}
        onChange={(e) => onSaveThmeColor(e.target.value)}
      />
    )
  }, [themeData?.themeColor])

  const onDelBackImage = () => {
    setUserAtom((v) => ({
      ...v,
      themeData: { ...v.themeData, backgroundImage: '', paperType: 'none' }
    }));
  }

  const savePaper = (value: string) => {
    const paper = themeData.paper !== value ? value : '';
    setUserAtom((v) => ({
      ...v,
      themeData: { ...v.themeData, paper, paperType: paper ? 'paper' : 'none' }
    }));
  }

  const handleFileChange = (file: File | null) => {
    if (file) {
      uploadFile(file).then(res => {
        console.log(res);
        if (res?.data?.url) {
          setUserAtom((v) => ({
            ...v,
            themeData: { ...v.themeData, backgroundImage: res?.data?.url, paperType: 'back' }
          }));
        } else {
          toast.warning(t('image_upload_failed'))
        }
      }).catch(() => {
        toast.warning(t('image_upload_failed'))
      })
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const savePresets = (themeColor: string, textColor: string) => {
    setUserAtom((v) => ({
      ...v,
      fontData: { ...v.fontData, textColor },
      themeData: { ...v.themeData, themeColor }
    }));
  }

  return (
    <div className="flex flex-col gap-7 overflow-y-auto px-5 pb-5 h-[calc(100vh-216px)]">
      <div className="flex flex-col gap-3">
        <div>{t('themeColors.title')}</div>
        <div className="flex items-center gap-4 flex-wrap">
          {
            themeColorList.map(item => (
              <div
                key={item.value}
                onClick={() => savePresets(item.value, item.labelColor)}
                style={{ backgroundColor: item.value, color: item.labelColor }}
                className={`border-2 rounded-lg text-sm p-3 cursor-pointer hover:border-[#8e47f0] ${themeData.themeColor === item.value && 'border-[#8e47f0]'}`}
              >
                {item.label}
              </div>
            ))
          }
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>{t('paperTypes.title')}</div>
        <div className="grid grid-cols-3 gap-5 text-black">
          {
            paperList.map(item => (
              <div
                key={item.value}
                onClick={() => savePaper(item.value)}
                style={{ backgroundImage: `url(${item.value})` }}
                className={`
                    border-2 rounded-lg text-sm cursor-pointer py-5 text-center hover:border-[#8e47f0]
                     ${(item.value === themeData.paper && themeData.paperType === 'paper') && 'border-[#8e47f0]'}
                  `}
              >
                {item.label}
              </div>
            ))
          }
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>{t('custom')}</div>
        <div className="grid grid-cols-1 gap-5 text-sm">
          <div className='grid grid-cols-1 gap-3'>
            <div className="flex items-center justify-between gap-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <input
                type="file"
                accept="image/*"
                className='hidden'
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />
              <div className="min-w-fit">{t('imageBackground')}</div>
              <div className="flex items-center gap-3">
                <div>{t('click_to_upload')}</div>
                <FaChevronRight />
              </div>
            </div>
            {
              themeData.backgroundImage &&
              <div className='flex justify-center'>
                <img
                  src={themeData.backgroundImage}
                  onClick={() => setUserAtom((v) => ({ ...v, themeData: { ...v.themeData, paperType: 'back' } }))}
                  className={`w-24 border-2 cursor-pointer hover:border-[#8e47f0] ${(themeData.paperType === 'back') && 'border-[#8e47f0]'}`}
                />
                <TiDeleteOutline className='text-xl text-red-600 cursor-pointer' onClick={onDelBackImage} />
              </div>
            }
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-fit">{t('solidBackground')}</div>
            {backColorPicker}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-fit">{t('textColor')}</div>
            {textColorPicker}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-fit">{t('sidebarTransparency')}</div>
            <Slider
              value={[themeData.sidebarTransparency]}
              max={1}
              min={0}
              step={0.1}
              onValueChange={(value) => setUserAtom((v) => ({ ...v, themeData: { ...v.themeData, sidebarTransparency: value[0] } }))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
