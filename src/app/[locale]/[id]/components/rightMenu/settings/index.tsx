import { useTranslations } from "next-intl";
import { useState } from "react"
import { getConstants } from "../../../constants";
import { ThemeMenu } from "../themeMenu";
import { FontMenu } from "../fontMenu";
import { PageLayout } from "../pagelayout";
import { Other } from "./other";
import { Paragraph } from "./paragraph";


export const Settings = () => {
  const t = useTranslations();
  const { SETTINGS_TAB } = getConstants(t);

  const [tab, setTab] = useState(1);

  const onRenderingTab = () => {
    switch (tab) {
      case 1:
        return (<ThemeMenu />)
      case 2:
        return (<FontMenu />)
      case 3:
        return (<PageLayout />)
      case 4:
        return (<Paragraph />)
      case 5:
        return (<Other />)
      default:
        return (<ThemeMenu />)
    }
  }

  return (
    <div className="flex flex-col gap-7 w-full">
      <h3 className="text-lg px-5 pt-5">{t('title')}</h3>
      <div className="flex items-center justify-evenly">
        {SETTINGS_TAB.map(item => (
          <div
            key={item.value}
            onClick={() => setTab(item.value)}
            className={`border-b-2 border-transparent px-1 cursor-pointer
              hover:text-[#8e47f0] hover:border-b-[#8e47f0]
               ${item.value === tab && 'text-[#8e47f0] border-b-[#8e47f0]'}
            `}
          >
            {item.label}
          </div>
        ))}
      </div>
      {onRenderingTab()}
    </div>
  )
}