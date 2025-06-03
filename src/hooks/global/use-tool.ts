import dayjs from "dayjs";
import { useTranslations } from "next-intl";

export const useTool = () => {
  const t = useTranslations();

  const formatTimeDiff = (time: string) => {
    const date = dayjs(time, "YYYY-MM-DD HH:mm:ss");
    if (!date.isValid()) {
      return '';
    }
    const diffSeconds = Math.abs(dayjs().diff(date, 'second'));
    if (diffSeconds < 60) {
      return diffSeconds === 0 ? t('time.justNow') : `${diffSeconds} ${t('time.secondsAgo')}`;
    }
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes} ${t('time.minutesAgo')}`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} ${t('time.hoursAgo')}`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ${t('time.daysAgo')}`;
  };

  const countWords = (content: string, includePunctuation: boolean) => {
    if (!content?.trim()) return 0;

    let totalCount = 0;
    let words: string[] = [];
    if (includePunctuation) {
      words = content.replace(/[^\w\s\u4e00-\u9fa5\u3040-\u30ff\u3400-\u4dbf\uf900-\ufaff\uff66-\uff9f]/g, '').split(/\s+/)
    } else {
      words = content.split(/\s+/)
    }

    for (const word of words) {
      if (word === '') continue;

      if (/^[a-zA-Z]+$/.test(word)) {
        totalCount += 1;
      } else if (/^\d+$/.test(word)) {
        totalCount += word.length;
      } else if (/^[a-zA-Z\d]+$/.test(word)) {
        let wordCount = 0;
        let hasLetter = false;
        for (const char of word) {
          if (/[a-zA-Z]/.test(char)) {
            if (!hasLetter) {
              wordCount += 1;
              hasLetter = true;
            }
          } else if (/\d/.test(char)) {
            wordCount += 1;
          }
        }
        totalCount += wordCount;
      } else {
        totalCount += word.length;
      }
    }

    return totalCount;
  };

  return { formatTimeDiff, countWords }
}
