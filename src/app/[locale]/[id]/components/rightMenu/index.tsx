import { useAtom } from "jotai";
import { userConfigAtom } from "@/stores";
import { FaRegTimesCircle } from "react-icons/fa";
import { ExportNovel } from "./exportNovel";
import { FindReplacement } from "./findReplacement";
import { AIWriting } from "./AIWriting";
import { WordCount } from "./wordCount";
import { Rnd } from "react-rnd";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { getConstants } from "../../constants";
import { Settings } from "./settings";

export const RightMenu = () => {
  const t = useTranslations();
  const { theme } = useTheme();
  const { MENU_LIST } = getConstants(t)

  const [{ opneRightMenu, themeData }, setUserAtom] = useAtom(userConfigAtom);

  const renderingMenu = () => {
    switch (opneRightMenu) {
      case 'exportNovel':
        return (<ExportNovel />)
      case 'setUp':
        return (<Settings />)
      case 'searchTxt':
        return (<FindReplacement />)
      case 'aiWriting':
        return (<AIWriting />)
      case 'wordCount':
        return (<WordCount />)
      default:
        break;
    }
  }

  const onClose = () => {
    setUserAtom((v) => ({ ...v, opneRightMenu: '' }))
  }

  const onSetopneRight = (value: string) => {
    setUserAtom((v) => ({
      ...v,
      opneRightMenu: v.opneRightMenu === value ? '' : value
    }))
  }

  return (
    <div
      className="w-full border-l flex flex-row-reverse"
      style={{ backgroundColor: `rgba(${theme === 'dark' ? '0,0,0' : '255,255,255'},${themeData.sidebarTransparency})` }}
    >
      <div className="w-[80px] flex flex-col gap-7 py-7  h-[calc(100vh-85px)] overflow-y-auto">
        {MENU_LIST.map(item => (
          <div className={`flex items-center flex-col gap-2 text-center group text-sm cursor-pointer 
             hover:text-[#8e47f0] ${item.value === opneRightMenu && 'text-[#8e47f0]'}`
          }
            key={item.value}
            onClick={() => onSetopneRight(item.value)}
          >
            <div className={`border rounded-full p-3 text-lg group-hover:border-[#8e47f0] ${item.value === opneRightMenu && 'border-[#8e47f0]'} `}>
              {<item.icon />}
            </div>
            {item.label}
          </div>
        ))}
      </div>
      {
        opneRightMenu && (
          <Rnd
            className={`border-r flex-1 !h-full !translate-x-0 !relative !cursor-default hidden ${opneRightMenu && '!block'}`}
            default={{
              x: 0,
              y: 0,
              width: 400,
              height: '100%',
            }}
            position={{ x: 0, y: 0 }}
            maxWidth={700}
            minWidth={400}
            enableResizing={{ left: true }}
            dragAxis={'none'}
            cancel=".no-drag"
          >
            <div className='absolute right-1 top-1 text-[#8e47f0] text-lg cursor-pointer z-10' onClick={onClose}>
              <FaRegTimesCircle />
            </div>
            {renderingMenu()}
          </Rnd>
        )
      }
    </div>
  )
}
