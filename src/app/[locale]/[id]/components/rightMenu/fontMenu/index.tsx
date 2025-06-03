import { useAtom } from 'jotai';
import React, { useMemo } from 'react';
import { HiBold } from "react-icons/hi2";
import { userConfigAtom } from '@/stores';
import { fontList } from '@/constants/font';
import { RxFontItalic } from "react-icons/rx";
import { Button } from '@/components/ui/button';
import { MdFormatUnderlined } from 'react-icons/md';
import { useLocale, useTranslations } from 'next-intl';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const FontMenu = () => {
  const locale = useLocale();
  const t = useTranslations('fontMenu');
  const [{ fontData }, setUserAtom] = useAtom(userConfigAtom);

  const { defaultFont, localeFont, fontSizeList } = fontList()

  const saveData = (name: string, value: any) => {
    setUserAtom((v) => ({ ...v, fontData: { ...v.fontData, [name]: value } }));
  }

  const colorPicker = useMemo(() => {
    return (
      <input
        type='color'
        className='cursor-pointer'
        value={fontData.textColor}
        onChange={(e) => saveData('textColor', e.target.value)}
      />
    )
  }, [fontData?.textColor])

  const memoizedFontGroups = useMemo(() => {
    const fontList = defaultFont.concat(localeFont[locale as 'zh' | 'en' | 'ja'])
    return (
      <SelectGroup>
        {fontList.map((font) => (
          <SelectItem key={font} value={font}>
            <span style={{ fontFamily: font }}>{font}</span>
          </SelectItem>
        ))}
      </SelectGroup>
    );
  }, [fontData?.font]);

  const memoizedFontSizeGroups = useMemo(() => {
    return (
      <SelectGroup>
        {fontSizeList.map((size) => (
          <SelectItem key={size} value={size}>
            {size}
          </SelectItem>
        ))}
      </SelectGroup>
    );
  }, [fontData?.fontSize]);

  return (
    <div className="flex flex-col gap-7 overflow-y-auto px-5 pb-5 h-[calc(100vh-216px)]">
      <Select onValueChange={(value) => saveData('font', value)} value={fontData?.font}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a font" />
        </SelectTrigger>
        <SelectContent>
          {memoizedFontGroups}
        </SelectContent>
      </Select>

      <div className='flex items-center justify-between gap-5'>
        <Select onValueChange={(value) => saveData('fontSize', value)} value={fontData?.fontSize}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a font" />
          </SelectTrigger>
          <SelectContent>
            {memoizedFontSizeGroups}
          </SelectContent>
        </Select>
        {colorPicker}
      </div>

      <div className='flex items-center justify-between gap-5'>
        <Button onClick={() => saveData('bold', !fontData.bold)} variant={fontData.bold ? 'default' : 'outline'} ><HiBold /></Button>
        <Button onClick={() => saveData('italic', !fontData.italic)} variant={fontData.italic ? 'default' : 'outline'} ><RxFontItalic /></Button>
        <Button onClick={() => saveData('underline', !fontData.underline)} variant={fontData.underline ? 'default' : 'outline'} ><MdFormatUnderlined /></Button>
      </div>
    </div>
  );
};
