import { useAtom } from "jotai";
import { userConfigAtom } from "@/stores";
import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";

export const Paragraph = () => {
  const t = useTranslations();
  const [{ moreSettingData }, setUserAtom] = useAtom(userConfigAtom);

  const saveData = (name: string, value: any) => {
    const newMoreSettingData = { ...moreSettingData, [name]: value };
    setUserAtom((v) => ({ ...v, moreSettingData: { ...newMoreSettingData } }));
  }

  return (
    <div className="flex flex-col gap-7 overflow-y-auto px-5 pb-5 h-[calc(100vh-216px)]">
      <div className="flex items-center justify-between gap-5">
        <div>{t('firstLineIndentation')}</div>
        <Switch checked={moreSettingData?.enableFirstLineIndent} id="enableFirstLineIndent" onCheckedChange={(v) => saveData('enableFirstLineIndent', v)} />
      </div>
      <div className="flex items-center justify-between gap-5">
        <div>{t('paragraphBlankLines')}</div>
        <Switch checked={moreSettingData?.enableParagraphSpacing} id="enableParagraphSpacing" onCheckedChange={(v) => saveData('enableParagraphSpacing', v)} />
      </div>
    </div>
  )
}
