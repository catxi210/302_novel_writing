import { useAtom } from "jotai";
import { debounce } from "lodash";
import ReactQuill from "react-quill";
import { TbReplace } from "react-icons/tb";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { IChapter } from "../../../interface";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IoSearchSharp } from "react-icons/io5";
import { Checkbox } from "@/components/ui/checkbox";
import { GoChevronDown, GoChevronUp } from "react-icons/go";
import { catalogueConfigAtom, userConfigAtom } from "@/stores";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { batchUpdateChapters } from "../../leftMenu/catalogue/indexDB";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ISearchResult { name: string, id: number, count: number }

export const FindReplacement = () => {
  const t = useTranslations('FindReplacement');
  const { id: parentId }: { id: string } = useParams();

  const [{ opneRightMenu }] = useAtom(userConfigAtom);
  const [{ chapterData, currentChapter, currentChapterIds }, setChapterAtom] = useAtom(catalogueConfigAtom);

  const quillRef: ReactQuill = (window as any).globalQuillRef;

  const inputRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState("");
  const [isReplace, setIsReplace] = useState(false);
  const [rplaceText, setReplaceText] = useState('')
  const [isComposing, setIsComposing] = useState(false);
  const [selectChapter, setSelectChapter] = useState('all');
  const [replaceData, setReplaceData] = useState({ txt: '', replace: false })
  const [searchCount, setSearchCount] = useState({ count: 0, current: 0, update: false })
  const [searchResult, setSearchResult] = useState<ISearchResult[]>([]);

  const onSelectChapter = () => {
    const list = [
      { label: t('searchAll'), value: 'all' },
      { label: t('currentPage'), value: 'current' }
    ]

    return (
      <>
        <SelectGroup>
          {list.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          {chapterData.map((item) => (
            <SelectItem key={`${item.id}`} value={`${item.id}`}>
              {t('searchInChapter', { chapterName: item.name })}
            </SelectItem>
          ))}
        </SelectGroup>
      </>
    )
  }

  const handleCompositionEnd = () => {
    setIsComposing(false);
    debouncedSearch(searchText);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    if (!value.trim().length) {
      quillRef.getEditor().removeFormat(0, quillRef.getEditor().getLength());
    }

    if (!isComposing) {
      setIsComposing(false);
      debouncedSearch(value);
    }
  };

  const debouncedSearch = debounce((value) => {
    countOccurrences(value)
  }, 500);

  // Count occurrences of search string
  const countOccurrences = (str: string) => {
    const searchTemp: ISearchResult[] = [];
    let count = 0;

    if (str) {
      if (selectChapter === 'all') {
        chapterData.forEach(item => {
          const regex = new RegExp(str, "g");
          const matches = String(item.content).match(regex);
          if (matches && matches.length > 0) {
            count += matches.length;
            searchTemp.push({ name: item.name, id: item.id!, count: matches.length })
          }
        });
      } else if (selectChapter === 'current') {
        const regex = new RegExp(str, "g");
        const matches = String(currentChapter?.content || '').match(regex);
        if (matches && matches.length > 0) {
          count += matches.length;
          searchTemp.push({ name: currentChapter.name, id: currentChapter.id!, count: matches.length })
        }
      } else {
        const data = chapterData.find(f => f.id === +selectChapter);
        if (data) {
          const regex = new RegExp(str, "g");
          const matches = String(data.content).match(regex);
          if (matches && matches.length > 0) {
            count = matches.length;
            searchTemp.push({ name: data.name, id: data.id!, count: matches.length })
          }
        }
      }
    }
    let current = 0;
    if (searchTemp.some(s => s.id === currentChapter.id!)) {
      for (let i = 0; i < searchTemp.length; i++) {
        const item = searchTemp[i];
        if (item.id === currentChapter.id) {
          current++;
          break;
        }
        current += item.count
      }
    }
    setSearchCount({ count, current, update: true });
    setSearchResult(searchTemp);
  };

  // Set highlight
  const onHighlight = (value: string) => {
    let index = 0;
    let matchCount = 0;
    const length = value.length;
    quillRef.getEditor().removeFormat(0, quillRef.getEditor().getLength());
    setSearchCount((v) => ({ ...v, update: false }))
    if (selectChapter !== 'all') {
      if (selectChapter === 'current' && !currentChapter?.id) {
        return;
      } else if (selectChapter !== 'current' && +selectChapter !== currentChapter.id) {
        return;
      }
    }
    for (let i = 0; i < searchResult.length; i++) {
      const element = searchResult[i];
      if (searchCount.current > index + element.count) {
        index += element.count;
      } else {
        break;
      }
    }
    if (length) {
      const reg = new RegExp(value, 'g');
      let match;
      while ((match = reg.exec(quillRef.getEditor().getText())) !== null) {
        matchCount++
        if (matchCount === (searchCount.current - index)) {
          quillRef.getEditor().formatText(match.index, length, 'background', 'yellow');
          const bounds = quillRef.getEditor().getBounds(match.index, length);
          if (bounds) {
            const editorScroll = quillRef.getEditor().root;
            editorScroll.scrollTo({
              top: bounds.top + editorScroll.scrollTop - 50,
              behavior: 'smooth',
            });
          }
        } else {
          quillRef.getEditor().formatText(match.index, length, 'background', '#00a4ff');
        }
      }
    }
  };

  const onCheckChapter = (id: number) => {
    const data = chapterData.find(f => f.id === id);
    if (data) {
      setChapterAtom((v) => ({
        ...v,
        currentChapter: { ...data },
        currentChapterIds: { ...v.currentChapterIds, [parentId]: id }
      }))
    }
  }

  // Switch to next/previous occurrence
  const onSwitchCount = (type: 'next' | 'previous') => {
    let tempCount = 0;
    for (let i = 0; i < searchResult.length; i++) {
      const item = searchResult[i];
      tempCount += item.count;
      if (type === 'next' && (searchCount.current < tempCount)) {
        if (item.id !== currentChapter.id) {
          onCheckChapter(item.id)
        } else {
          setSearchCount((v) => ({ ...v, update: true, current: v.current + 1 }));
        }
        return
      }
      if (type === 'previous' && (tempCount >= searchCount.current - 1)) {
        if (item.id !== currentChapter.id) {
          onCheckChapter(item.id)
        } else {
          setSearchCount((v) => ({ ...v, update: true, current: v.current - 1 }));
        }
        return
      }
    }
  }

  // Replace string
  const onReplace = (type: 'current' | 'all') => {
    if (type === 'current') {
      let tempCount = 0;
      for (let i = 0; i < searchResult.length; i++) {
        const item = searchResult[i];
        if (tempCount + item.count >= searchCount.current) {
          const tempData = chapterData.find(f => f.id === item.id);
          let count = 0;
          if (tempData) {
            const newTxt = tempData?.content.replace(new RegExp(searchText, "g"), () => {
              count++;
              return (count === searchCount.current || count === searchCount.current - tempCount) ? rplaceText : searchText;
            });
            if (item.id !== currentChapterIds[parentId]) {
              onCheckChapter(item.id);
              setTimeout(() => {
                setReplaceData({ txt: newTxt, replace: true });
              }, 100)
            } else {
              quillRef.getEditor().setText(newTxt, 'user');
            }
          }
          return;
        }
        tempCount += item.count;
      }
    }

    if (type === 'all') {
      const chapterUpdates = [];
      if (selectChapter === 'current') {
        const content = quillRef.getEditor().getText().split(searchText).join(rplaceText);
        quillRef.getEditor().setText(content, 'user');
        return;
      } else {
        const id = selectChapter.split('-')[1];
        for (let i = 0; i < searchResult.length; i++) {
          const item = searchResult[i];
          const chapter = chapterData.find(f => f.id === item.id)
          if (chapter) {
            const content = chapter.content.split(searchText).join(rplaceText);
            if (+id === item.id) {
              if (+id !== currentChapterIds[parentId]) {
                onCheckChapter(+id);
                setReplaceData({ txt: content, replace: true });
              } else {
                quillRef.getEditor().setText(content, 'user');
              }
              return;
            } else if (item.id === currentChapterIds[parentId]) {
              quillRef.getEditor().setText(content, 'user');
            } else {
              chapterUpdates.push({ ...chapter, content })
            }
          }
        }
      }
      if (chapterUpdates.length) {
        batchUpdateChapters(chapterUpdates, +parentId).then(res => {
          const currentTemp = res.find(f => f.id === currentChapterIds[parentId]);
          setChapterAtom((v) => ({ ...v, chapterData: res, currentChapter: currentTemp || {} as IChapter }))
        })
      }
    }
  }

  useEffect(() => {
    setSearchCount((v) => ({ ...v, update: false }))
    if (searchCount.update && searchText) {
      setTimeout(() => {
        onHighlight(searchText)
      }, 100)
    }
  }, [searchCount.update, quillRef])

  useEffect(() => {
    if (selectChapter === 'all') {
      let tempCount = 0;
      for (let i = 0; i < searchResult.length; i++) {
        const item = searchResult[i];
        if (item.id === currentChapter.id) {
          setSearchCount((v) => ({ ...v, update: true, current: tempCount + 1 }));
          return;
        }
        tempCount += item.count
      }
    } else {
      countOccurrences(searchText);
    }
  }, [currentChapter?.id])

  useEffect(() => {
    if (quillRef) {
      quillRef.getEditor().removeFormat(0, quillRef.getEditor().getLength());
    }
    countOccurrences(searchText);
  }, [selectChapter, chapterData])

  useEffect(() => {
    if (replaceData.replace && quillRef) {
      setTimeout(() => {
        quillRef.getEditor().setText(replaceData.txt, 'user');
      }, 10)
      setReplaceData({ txt: '', replace: false })
    }
  }, [replaceData.replace, quillRef])

  useEffect(() => {
    return () => {
      if (quillRef) {
        quillRef.getEditor().removeFormat(0, quillRef.getEditor().getLength());
      }
    }
  }, [opneRightMenu])

  return (
    <div className="flex flex-col gap-7 w-full">
      <h3 className="text-lg px-5 pt-5">{t('searchRange')}</h3>
      <div className="flex flex-col gap-7 overflow-y-auto px-5 pb-5 h-[calc(100vh-163px)]">

        <Select
          value={selectChapter}
          onValueChange={(value) => {
            const id = value.split('-')[1];
            if (value.indexOf('chapter-') > -1) {
              onCheckChapter(+id)
            }
            if (value.indexOf('draft-') > -1) {
              onCheckChapter(+id)
            }
            setSelectChapter(value);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {onSelectChapter()}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 border rounded-lg px-2">
          <IoSearchSharp className="text-xl" />
          <Input
            ref={inputRef}
            value={searchText}
            onChange={handleSearchChange}
            className="border-none shadow-none !ring-0 no-drag"
            placeholder={t('enterSearchContent')}
            onCompositionEnd={handleCompositionEnd}
            onCompositionStart={handleCompositionStart}
          />
          <div className="text-sm">
            {searchCount.current}/{searchCount.count}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button disabled={searchCount.current < 2} onClick={() => onSwitchCount('previous')}><GoChevronUp />{t('previous')}</Button>
          <Button disabled={searchCount.current === searchCount.count} onClick={() => onSwitchCount('next')}><GoChevronDown />{t('next')}</Button>
        </div>

        <div className="flex items-center gap-5 border rounded-lg px-2 py-[5px] cursor-pointer">
          <Checkbox id="replace" checked={isReplace} onCheckedChange={(checked: boolean) => setIsReplace(checked)} />
          <label htmlFor="replace" className="w-full">{t('replace')}</label>
        </div>

        {
          isReplace && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border rounded-lg px-2">
                <TbReplace className="text-xl" />
                <Input
                  value={rplaceText}
                  placeholder={t('enterReplaceContent')}
                  className="border-0 shadow-none !ring-0 no-drag"
                  onChange={(e) => setReplaceText(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  disabled={!searchCount?.count || !searchCount.current || !rplaceText.trim().length}
                  onClick={() => onReplace('current')}
                >
                  {t('replace')}
                </Button>
                <Button
                  disabled={!searchCount?.count || !rplaceText.trim().length}
                  onClick={() => onReplace('all')}
                >
                  {t('replaceAll')}
                </Button>
              </div>
            </div>
          )
        }
      </div>
    </div >
  )
}
