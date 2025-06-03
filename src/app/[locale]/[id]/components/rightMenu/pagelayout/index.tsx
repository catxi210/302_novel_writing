import { useAtom } from "jotai"
import { userConfigAtom } from "@/stores"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

export const PageLayout = () => {
  const t = useTranslations('pageLayout');
  const [{ layoutData }, setUserAtom] = useAtom(userConfigAtom);

  const editorSizeList = [
    { label: t('narrow'), value: 640 },
    { label: t('standard'), value: 800 },
    { label: t('wide'), value: 1280 },
  ]

  const saveData = (name: string, value: any) => {
    setUserAtom((v) => ({ ...v, layoutData: { ...v.layoutData, [name]: value } }));
  }

  return (
    <div className="flex flex-col gap-7 overflow-y-auto px-5 pb-5 h-[calc(100vh-216px)]">
      <div className="flex flex-col gap-3">
        <div>{t('editorWidth')}</div>
        <div className="flex items-center justify-between gap-5">
          {
            editorSizeList.map(item => (
              <Button
                key={item.value}
                onClick={() => saveData('editorSize', item.value)}
                variant={layoutData?.editorSize === item.value ? 'default' : 'outline'}
              >
                {item.label}
              </Button>
            ))
          }
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div>{t('letterSpacing')}</div>
        <div className="flex items-center gap-3">
          <Slider value={[layoutData?.letterSpacing]} max={10} step={1} onValueChange={(value) => saveData('letterSpacing', value[0])} />
          <span className="text-sm">{layoutData?.letterSpacing}</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div>{t('lineSpacing')}</div>
        <div className="flex items-center gap-3">
          <Slider value={[layoutData?.lineHeight]} max={10} min={0} step={0.1} onValueChange={(value) => saveData('lineHeight', value[0])} />
          <span className="text-sm">{layoutData?.lineHeight}</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div>{t('horizontalMargins')}</div>
        <div className="flex items-center gap-3">
          <Slider value={[layoutData?.sideMargin]} max={100} step={1} onValueChange={(value) => saveData('sideMargin', value[0])} />
          <span className="text-sm">{layoutData?.sideMargin}</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div>{t('bottomSafeDistance')}</div>
        <div className="flex items-center gap-3">
          <Slider value={[layoutData?.bottomSpacing]} max={100} min={1} step={1} onValueChange={(value) => saveData('bottomSpacing', value[0])} />
          <span className="text-sm">{layoutData?.bottomSpacing}</span>
        </div>
      </div>
    </div>

  )
}
