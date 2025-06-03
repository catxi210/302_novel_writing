import { useAtom } from "jotai";
import { userConfigAtom } from "@/stores";
import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export const Other = () => {
  const t = useTranslations();
  const [{ moreSettingData, tempModel }, setUserAtom] = useAtom(userConfigAtom);

  const saveData = (name: string, value: any) => {
    const newMoreSettingData = { ...moreSettingData, [name]: value };
    setUserAtom((v) => ({ ...v, moreSettingData: { ...newMoreSettingData } }));
  }

  return (
    <div className="flex flex-col gap-7 overflow-y-auto px-5 pb-5 h-[calc(100vh-216px)]">
      <div className="grid grid-cols-1 gap-3">
        <div>{t('wordCountSettings')}</div>
        <div className="grid grid-cols-1 gap-5 pl-5">
          <div className="flex items-center justify-between gap-5">
            <div>{t('withoutPunctuationMarks')}</div>
            <Switch checked={moreSettingData?.ignorePunctuation} id="ignorePunctuation" onCheckedChange={(v) => saveData('ignorePunctuation', v)} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-5">
        <div>{t('scrollToEnd')}</div>
        <Switch checked={moreSettingData?.scrollToBottomOnOpen} id="scrollToBottomOnOpen" onCheckedChange={(v) => saveData('scrollToBottomOnOpen', v)} />
      </div>
      {/* <div className="grid grid-cols-1 gap-3">
        <div>{t('model')}</div>
        <div className="grid grid-cols-1 gap-5 px-2">
          <Input className="no-drag" value={tempModel} onChange={(e) => setUserAtom((v) => ({ ...v, tempModel: e.target.value }))} />
        </div>
      </div> */}
    </div>
  )
}
