import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { userConfigAtom } from "@/stores";
import { getWordCountData } from "./indexDB";

export const useStatistics = () => {
  const [{ typing, isFreeTime }, setUserAtom] = useAtom(userConfigAtom);

  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const freeTimer = useRef<NodeJS.Timeout | null>(null);

  // 计算码字时间
  useEffect(() => {
    if (!typing && typingTimer?.current) {
      clearInterval(typingTimer.current);
      typingTimer.current = null;
    }
    if (typing) {
      typingTimer.current = setInterval(() => {
        setUserAtom((v) => ({
          ...v,
          typingTime: v.typingTime + 1
        }))
      }, 1000);
    }

    return () => {
      if (typingTimer?.current) {
        clearInterval(typingTimer.current);
        typingTimer.current = null;
      }
    }
  }, [typing])

  // 计算空闲时间
  useEffect(() => {
    if (!isFreeTime && freeTimer?.current) {
      clearInterval(freeTimer.current);
      freeTimer.current = null;
    }
    if (isFreeTime) {
      freeTimer.current = setInterval(() => {
        setUserAtom((v) => ({
          ...v,
          freeTime: v.freeTime + 1
        }))
      }, 1000);
    }

    return () => {
      if (freeTimer?.current) {
        clearInterval(freeTimer.current);
        freeTimer.current = null;
      }
    }
  }, [isFreeTime])

  // 获取当天的输入字数
  useEffect(() => {
    getWordCountData().then(res => {
      setUserAtom((v) => ({ ...v, oldDayTypingLength: res.wordCount || 0, dayTypingLength: res.wordCount || 0 }))
    })
  }, [])

}