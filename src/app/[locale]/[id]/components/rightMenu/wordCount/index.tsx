
import { useAtom } from 'jotai';
import React, { useState } from 'react';
import { PieChartCom } from './pieChart';
import { LineChartCom } from './lineChart';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useTool } from '@/hooks/global/use-tool';
import { catalogueConfigAtom, userConfigAtom } from '@/stores';

export const WordCount = () => {
  const { countWords } = useTool()
  const t = useTranslations('wordCount');
  const { id: parentId }: { id: string } = useParams();

  const [{ moreSettingData, typingTime, freeTime, typingLength }, setUserAtom] = useAtom(userConfigAtom);
  const [{ chapterData, currentChapterIds }] = useAtom(catalogueConfigAtom);

  const [line, setLine] = useState<7 | 30>(7);

  const onCountWords = (type: 'current' | 'all') => {
    if (type === 'current') {
      return countWords(chapterData.find(f => f.id === currentChapterIds[parentId])?.content || '', moreSettingData?.ignorePunctuation)
    }
    if (type === 'all') {
      let text = '';
      for (let index = 0; index < chapterData.length; index++) {
        const element = chapterData[index];
        text += element.content;
      }
      return countWords(text, moreSettingData?.ignorePunctuation)
    }
  }

  const formatTime = (totalSeconds: number): string => {
    const seconds = Math.max(0, Math.floor(totalSeconds));

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;
  };

  const inputSpeed = () => {
    if (typingLength === 0 || typingTime === 0) {
      return 0;
    } else {
      return Math.floor((typingLength / typingTime) * 3600);
    }
  }

  return (
    <div className="w-full">
      <h3 className="text-lg px-5 pt-5 mb-7">{t('wordCount')}</h3>

      <div className='flex flex-col gap-7 overflow-y-auto px-5 pb-5 h-[calc(100vh-163px)]'>
        <div className='border rounded-lg p-3 flex items-center justify-between'>
          <div className='flex flex-col gap-2'>
            <div className='text-slate-500 text-sm'>{t('thisTimeWordCount')}</div>
            <div>{typingLength || 0}</div>
          </div>
          <div className='flex flex-col gap-2'>
            <div className='text-slate-500 text-sm'>{t('inputSpeed')}</div>
            <div>{inputSpeed()}</div>
          </div>
        </div>

        <div className='border rounded-lg p-3 flex items-center justify-between'>
          <div className='flex flex-col gap-2'>
            <div className='text-slate-500 text-sm'>{t('typingTime')}</div>
            <div>{formatTime(typingTime || 0)}</div>
          </div>
          <div className='flex flex-col gap-2'>
            <div className='text-slate-500 text-sm'>{t('idleTime')}</div>
            <div>{formatTime(freeTime || 0)}</div>
          </div>
        </div>

        <div className='border rounded-lg p-3 flex items-center justify-between'>
          <div className='flex flex-col gap-2'>
            <div className='text-slate-500 text-sm'>{t('currentChapterWordCount')}</div>
            <div>{onCountWords('current') || 0}</div>
          </div>
          <div className='flex flex-col gap-2'>
            <div className='text-slate-500 text-sm'>{t('totalBookWordCount')}</div>
            <div>{onCountWords('all') || 0}</div>
          </div>
        </div>

        <div>
          <div className='text-sm'>{t('wordCountDistribution')}</div>
          <PieChartCom />
        </div>

        <div>
          <div className='flex items-center justify-between text-sm mb-3'>
            <div>{t('inputWordCount')}</div>
            <div className='flex items-center gap-3'>
              <div onClick={() => setLine(7)} className={`cursor-pointer border-b border-background ${line === 7 && 'border-b-[#8e47f0]'}`}>{t('last7Days')}</div>
              <div onClick={() => setLine(30)} className={`cursor-pointer border-b border-background ${line === 30 && 'border-b-[#8e47f0]'}`}>{t('last30Days')}</div>
            </div>
          </div>
          <LineChartCom type={line} />
        </div>
      </div>

    </div>
  );
};
