import { IChapter } from "@/app/[locale]/[id]/interface";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

export type ChapterConfigState = {
  chapterData: IChapter[];
  currentChapter: IChapter;
  currentChapterIds: { [key: string]: number };
};

export const catalogueConfigAtom = atomWithStorage<ChapterConfigState>(
  "catalogueConfig",
  {
    chapterData: [],
    currentChapterIds: {},
    currentChapter: {} as IChapter,
  },
  createJSONStorage(() =>
    typeof window !== "undefined"
      ? sessionStorage
      : {
        getItem: () => null,
        setItem: () => null,
        removeItem: () => null,
      }
  ),
  {
    getOnInit: true,
  }
);
