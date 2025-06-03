import { gameAnimeList } from "@/constants/novelStyleType/gameAnime"
import { modernRomanceList } from "@/constants/novelStyleType/modernRomance"
import { ancientRomanceList } from "@/constants/novelStyleType/ancientRomance"
import { fantasyRomanceList } from "@/constants/novelStyleType/fantasyRomance"
import { ancientHistoryList } from "@/constants/novelStyleType/ancientHistory"
import { ancientTimeTravelList } from "@/constants/novelStyleType/ancientTimeTravel"
import { suspenseBrainHoleList } from "@/constants/novelStyleType/suspenseBrainHole"
import { illusoryAndFictionalList } from "@/constants/novelStyleType/illusoryAndFictional"
import { zhihuShortStoryRomanceList } from "@/constants/novelStyleType/zhihuShortStoryRomance"

import { GiFeather } from "react-icons/gi";
import { TbReplace } from "react-icons/tb";
import { TfiExport } from "react-icons/tfi";
import { FaChartPie } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";

export const getConstants = (t: any) => {
  const WRITING_STYLE = [
    {
      name: t('writingStyle.Modern_romance'),
      value: 'Modern romance',
      list: [...modernRomanceList]
    },
    {
      name: t('writingStyle.Ancient_time_travel'),
      value: 'Ancient time travel',
      list: [...ancientTimeTravelList]
    },
    {
      name: t('writingStyle.Ancient_romance'),
      value: 'Ancient romance',
      list: [...ancientRomanceList]
    },
    {
      name: t('writingStyle.Fantasy_romance'),
      value: 'Fantasy romance',
      list: [...fantasyRomanceList]
    },
    {
      name: t('writingStyle.Ancient_History'),
      value: 'Ancient History',
      list: [...ancientHistoryList]
    },
    {
      name: t('writingStyle.Illusory_and_fictional'),
      value: 'Illusory and fictional',
      list: [...illusoryAndFictionalList]
    },
    {
      name: t('writingStyle.Suspense_Brain_Hole'),
      value: 'Suspense Brain Hole',
      list: [...suspenseBrainHoleList]
    },
    {
      name: t('writingStyle.Game_anime'),
      value: 'Game anime',
      list: [...gameAnimeList]
    },
    {
      name: t('writingStyle.Zhihu_short_story_romance'),
      value: 'Zhihu short story romance',
      list: [...zhihuShortStoryRomanceList]
    },
  ]

  const AIWRITINGFORMTIPS: { [key: string]: any } = {
    synopsis: t('synopsis_tips'),
    backgroundStory: t('characterRelationships_tips'),
    writingStyle: t('writingStyle_tips'),
    fragmentedPlot: t('fragmentedPlot_tips'),
    writingRequirements: t('writingRequirements_tips'),
    previousClip: t('previousClip_tips'),
    character: t('character_tips'),
    introduction:t('introduction_tips')
  }

  const MENU_LIST = [
    { label: t('topMenu.aiWriting'), value: 'aiWriting', icon: GiFeather },
    { label: t('topMenu.wordCount'), value: 'wordCount', icon: FaChartPie },
    { label: t('topMenu.findReplace'), value: 'searchTxt', icon: TbReplace },
    { label: t('topMenu.export'), value: 'exportNovel', icon: TfiExport },
    { label: t('topMenu.settings'), value: 'setUp', icon: IoSettingsOutline },
  ]

  const SETTINGS_TAB = [
    { value: 1, label: t('settingsTab.theme') },
    { value: 2, label: t('settingsTab.font') },
    { value: 3, label: t('settingsTab.layout') },
    { value: 4, label: t('settingsTab.paragraph') },
    { value: 5, label: t('settingsTab.other') },
  ]
  return { WRITING_STYLE, AIWRITINGFORMTIPS, MENU_LIST, SETTINGS_TAB }
}
