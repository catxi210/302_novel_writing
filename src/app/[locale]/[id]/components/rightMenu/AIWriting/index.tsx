import { toast } from "sonner";
import { useAtom } from "jotai";
import ReactQuill from "react-quill";
import { Loader2 } from "lucide-react";
import { FaCopy } from "react-icons/fa";
import { CiStop1 } from "react-icons/ci";
import { GiFeather } from "react-icons/gi";
import { useParams } from "next/navigation";
import { readStreamableValue } from "ai/rsc";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { getConstants } from "../../../constants";
import { MdTipsAndUpdates } from "react-icons/md";
import { MarkdownViewer } from "./MarkdownViewer";
import { Character } from "./components/character";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { useLocale, useTranslations } from "next-intl";
import { ErrorToast } from "@/components/ui/errorToast";
import { IChapter, ICharacter } from "../../../interface";
import { addChapter } from "../../leftMenu/catalogue/indexDB";
import { advanceRole, extractRoles, generateFragmentedPlot, generateNovel } from "./service";
import { appConfigAtom, catalogueConfigAtom, userConfigAtom } from "@/stores";
import { BsChevronContract, BsChevronExpand, BsPatchQuestion } from "react-icons/bs";
import { getCharacterListByParentId, saveBatchCharacters } from "./components/character/indexDB";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { updateData } from "@/components/bookCard/indexDB";

const initialValue = {
  synopsis: 'customize',
  synopsisCustomize: '',
  characterRelationships: '',
  writingStyle: 'Modern romance',
  writingStyleCustomize: '',
  fragmentedPlot: '',
  writingRequirements: '',
  previousClip: 'customize',
  previousClipCustomize: '',
  character: [],
  chapterCount: 10,
  chapterOrder: 1,
  introduction: '',
  backgroundStory: '',
}

export const AIWriting = () => {
  const t = useTranslations();
  const { id: parentId }: { id: string } = useParams();
  const { AIWRITINGFORMTIPS, WRITING_STYLE } = getConstants(t);

  const [{ apiKey = '', modelName = '' }] = useAtom(appConfigAtom);
  const [{ chapterData, currentChapter }, setChapterAtom] = useAtom(catalogueConfigAtom);
  const [{ tempModel, opneRightMenu, writingForm }, setUserAtom] = useAtom(userConfigAtom);

  const locale = useLocale();
  const [isLoad, setIsLoad] = useState(false);
  const [buildAction, setBuildAction] = useState('');
  const [isNextLoad, setIsNextLoad] = useState(false);
  const [isPlotLoad, setIsPlotLoad] = useState(false);
  const [generateQuantity, setGenerateQuantity] = useState(true)
  const [example, setExample] = useState<{ [key: string]: boolean }>({});

  const [expandMore, setExpandMore] = useState(false);
  const form = writingForm[parentId];
  const quillRef: ReactQuill = (window as any).globalEditorRef
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [countdown, setCountdown] = useState(30);
  const [startTiming, setStartTiming] = useState(false);

  useEffect(() => {
    if (startTiming) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else if (countdown === 0) {
        setIsNextLoad(true);
        onGenerateNovel('next');
      }
    } else {
      setCountdown(30);
    }
  }, [startTiming, countdown]);

  useEffect(() => {
    if (opneRightMenu === 'aiWriting') {
      const lastData = chapterData[chapterData.length - 1];
      setUserAtom((v) => {
        return {
          ...v,
          writingForm: {
            ...v.writingForm,
            [parentId]: {
              ...initialValue,
              ...v.writingForm[parentId],
              synopsis: `${lastData?.id || 'customize'}`,
              previousClip: `${lastData?.id || 'customize'}`,
            }
          }
        }
      })
    }
  }, [parentId, opneRightMenu])

  useEffect(() => {
    if (isLoad && form?.contentPlanning) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 200)
    }
  }, [isLoad, form?.contentPlanning])

  const saveForm = async (name: string, value: any) => {
    if (name === 'introduction') {
      await updateData(+parentId, { [name]: value })
    }
    setUserAtom((v) => ({
      ...v,
      writingForm: {
        ...v.writingForm,
        [parentId]: {
          ...v.writingForm[parentId],
          [name]: value
        }
      }
    }))
  }

  const tooltip = (type: string) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='icon' size='icon' className="!w-auto !h-auto">
              <BsPatchQuestion />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-[250px]">{AIWRITINGFORMTIPS[type]}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const synopsisSelect = () => {
    return (
      <Select value={form?.synopsis} onValueChange={(value) => saveForm('synopsis', value)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="customize">{t('customize')}</SelectItem>
            {
              chapterData.map(item => (
                <SelectItem key={`${item.id}`} value={`${item.id}`}>{item.name}</SelectItem>
              ))
            }
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }

  const previousClipSelect = () => {
    return (
      <Select value={form?.previousClip} onValueChange={(value) => saveForm('previousClip', value)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="customize">{t('customize')}</SelectItem>
            {
              chapterData.map(item => (
                <SelectItem key={`${item.id}`} value={`${item.id}`}>{item.name}</SelectItem>
              ))
            }
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }

  const writingStyleSelect = () => {
    return (
      <Select value={form?.writingStyle} onValueChange={(value) => saveForm('writingStyle', value)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="customize">{t('customize')}</SelectItem>
            {
              WRITING_STYLE.map(item => (
                <SelectItem key={item.value} value={item.value}>{item.name}</SelectItem>
              ))
            }
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }

  const saveExample = (name: string) => {
    setExample((v) => ({ ...v, [name]: !v[name] }))
  }

  const checkForm = (isPlot?: boolean) => {
    const reset = () => {
      setIsLoad(false);
      setIsNextLoad(false);
      setBuildAction('')
      return false;
    }
    if (generateQuantity) {
      if (form?.chapterOrder < 1) {
        toast.warning(t('chapterOrder_warning'))
        return reset()
      }
      if (form.chapterCount < 1) {
        toast.warning(t('chapterCount_warning'))
        return reset()
      }
      if (+form.chapterCount < +form?.chapterOrder) {
        toast.warning(t('stop_generate'))
        return reset()
      }
      if (form?.chapterOrder > 1) {
        if (form.synopsis === 'customize' && !form.synopsisCustomize.trim().length) {
          toast.warning(t('chapterOrder_warning1'))
          return reset()
        }
        if (form.synopsis !== 'customize') {
          const tmepData = chapterData.find(f => f.id === +form.synopsis);
          if (!tmepData || !tmepData.content.trim().length) {
            toast.warning(t('synopsis_warning'))
            return reset()
          }
        }
        if (form.previousClip === 'customize' && !form.previousClipCustomize.trim().length) {
          toast.warning(t('previousClip_warning'))
          return reset()
        }
        if (form.previousClip !== 'customize') {
          const tmepData = chapterData.find(f => f.id === +form.previousClip);
          if (!tmepData || !tmepData.content.trim().length) {
            toast.warning(t('previousClip_warning1'))
            return reset()
          }
        }
      }
    }
    if (!isPlot) {
      if (!form?.writingRequirements.trim().length || !form?.fragmentedPlot.trim().length || !form?.introduction.trim().length) {
        toast.warning(t('required_warning'))
        return reset()
      }
    }
  }

  const onExtractRoles = async () => {
    let roleIds: number[] = [];
    try {
      const result = await extractRoles({
        apiKey,
        lang: locale,
        content: form.contentPlanning,
        modelName: tempModel || modelName,
      })
      if (result.data) {
        const names = result.data.split('\n').map((name: string) => name.trim());
        if (names) {
          const characterList = await getCharacterListByParentId(+parentId);
          const temp = characterList.filter(f => names.includes(f.name));
          roleIds = temp.map(item => item.id!)
          if (temp) {
            setUserAtom((v) => {
              let tempCharacter = v.writingForm?.[parentId]?.character || [];
              tempCharacter = [...new Set([...tempCharacter, ...roleIds])]
              return {
                ...v,
                writingForm: {
                  ...v.writingForm,
                  [parentId]: {
                    ...v.writingForm[parentId],
                    character: tempCharacter
                  }
                }
              }
            })
          }
        }
      }
    } catch (error) {
    }
    return roleIds;
  }

  const onGenerateNovel = async (type: 'next' | 'new') => {

    const data = form;
    setStartTiming(false);
    setBuildAction(t('idea'));
    let roleIds: number[] = []

    if (type === 'next') {
      saveForm('fragmentedPlot', form.contentPlanning);
      roleIds = await onExtractRoles();
    }

    if (checkForm() === false) {
      return;
    }

    if (form?.synopsis !== 'customize') {
      const content = chapterData.find(f => f.id === +form?.synopsis)?.content || '';
      data.synopsisCustomize = content;
    }

    if (form?.writingStyle !== 'customize') {
      const temp = WRITING_STYLE.find(f => f.value === form?.writingStyle);
      if (temp) {
        const index = Math.floor(Math.random() * temp?.list?.length);
        data.writingStyleCustomize = `${temp.name} \n ${temp.list[index]}`;
      }
    }

    if (form?.previousClip !== 'customize') {
      const content = chapterData.find(f => f.id === +form?.previousClip)?.content || '';
      data.previousClipCustomize = content;
    }

    let characterRelationships = '';
    if (form.character.length || roleIds.length) {
      const characterList = await getCharacterListByParentId(+parentId);
      const names = [...new Set([...form.character, ...roleIds])]
      characterList.filter(f => names.includes(f.id!)).forEach(item => {
        characterRelationships += `
        ${t('roleName')}: ${item.name}
        ${t('describe')}: ${item.content} \n
        `
      })
    }
    const titles = chapterData.map(item => item.name).join('、')
    try {
      const result = await generateNovel({
        apiKey,
        titles,
        lang: locale,
        generateQuantity,
        modelName: tempModel || modelName,
        form: {
          ...data,
          characterRelationships,
          fragmentedPlot: type === 'next' ? form.contentPlanning : form.fragmentedPlot
        },

      })
      let newData: IChapter = {
        id: -1,
        content: '',
        updatedAt: '',
        parentId: +parentId,
        name: '',
      }
      if (result?.output) {
        for await (const delta of readStreamableValue(result.output)) {
          if (delta?.type === 'title-delta') {
            if (currentChapter?.id && !currentChapter?.content?.trim()?.length) {
              newData = currentChapter;
            }
            newData.name = delta.textDelta?.trim().length ? delta.textDelta : t('catalogue.undefined_title');
            setChapterAtom((v) => ({
              ...v,
              currentChapter: { ...newData },
              currentChapterIds: { ...v.currentChapterIds, [parentId]: newData.id! },
              chapterData: newData?.id! < 0 ? [...v.chapterData, { ...newData }] : v.chapterData.map(item =>
                item.id === newData.id ? { ...newData } : item
              ),
            }));
          }
          if (delta?.type === 'text-delta') {
            newData.content = delta.textDelta || '';
            if (quillRef) {
              quillRef.getEditor().enable(false)
              quillRef.getEditor().setText(delta.textDelta || '');
              // @ts-ignore
              quillRef.getEditor().history.clear();
              const editorContent = quillRef.getEditor().root;
              if (editorContent) {
                editorContent.scrollTop = editorContent.scrollHeight;
              }
            }
            setChapterAtom((v) => ({
              ...v,
              currentChapter: { ...newData },
              currentChapterIds: { ...v.currentChapterIds, [parentId]: newData.id! },
              chapterData: v.chapterData.map(item =>
                item.id === newData.id ? { ...newData } : item
              ),
            }));
          }
          if (delta?.type === 'contentPlanning') {
            saveForm('contentPlanning', delta.textDelta);
          } else if (delta?.type === 'logprobs') {
            setBuildAction(t('advanceRole'))
            await onAdvanceRole(newData.content)
            await addChapter({ ...newData }).then(res => {
              const tempData = res[res.length - 1];
              setChapterAtom((v) => ({
                ...v,
                chapterData: res,
                currentChapter: { ...tempData },
                currentChapterIds: { ...v.currentChapterIds, [parentId]: tempData.id! }
              }));
              saveForm('synopsis', `${tempData.id!}`)
              saveForm('previousClip', `${tempData.id!}`)
              if (generateQuantity && form.chapterOrder <= form.chapterCount) {
                saveForm('chapterOrder', +form.chapterOrder + 1)
              }
              toast.success(t('generateComplete'), { position: "top-right" });
              quillRef.getEditor().enable(true)
            }).catch(() => {
              toast.warning(t('Storage_failed'), { position: "top-right" });
            });
            if (!generateQuantity || (generateQuantity && form.chapterOrder < form.chapterCount)) {
              setStartTiming(true)
            }
          }
        }
      }
    } catch (error: any) {
      if (error?.message?.error?.err_code) {
        toast(() => (ErrorToast(error.message.error.err_code)), { position: "top-right" })
      } else {
        toast(t('generateFailed'), { position: "top-right" })
      }
    }
    setBuildAction('');
    setIsLoad(false);
    setIsNextLoad(false);
  }

  const onAdvanceRole = async (content: string) => {
    try {
      const characterList = await getCharacterListByParentId(+parentId);
      const result = await advanceRole({
        apiKey,
        content,
        list: characterList,
        modelName: tempModel || modelName,
      });
      if (result.data) {
        const parser = new DOMParser();
        const xmlDataWithRoot = `<root>${result.data}</root>`;
        const xmlDoc = parser.parseFromString(xmlDataWithRoot, "application/xml");
        const noNewCharactersNode = xmlDoc.querySelector("no_new_characters");
        if (!noNewCharactersNode) {
          const characters: ICharacter[] = [];
          Array.from(xmlDoc.querySelectorAll("character")).forEach((char) => {
            if (!characterList.some(s => s.name === char.querySelector("name")?.textContent)) {
              characters.push({
                name: char.querySelector("name")?.textContent || '',
                content: char.querySelector("description")?.textContent || '',
                parentId: +parentId,
                labelColor: '#ffffff',
              })
            }
          });
          if (characters.length) {
            await saveBatchCharacters(characters)
          }
        }
      } else if (result?.error) {
        if (result?.error?.err_code) {
          toast(() => (ErrorToast(result.error.err_code)))
        } else {
          toast(t('advanceRoleFailed'), { position: "top-right" })
        }
      }
    } catch (error) {
      toast(t('advanceRoleFailed'), { position: "top-right" })
    }
  }

  const onCopyCharacter = async () => {
    try {
      await navigator.clipboard.writeText(form?.contentPlanning);
      toast.success(t('copy_success'))
    } catch (err) {
      toast.error(t('copy_error'))
    }
  };

  const onGenerateFragmentedPlot = async (id?: number) => {
    if (isPlotLoad || isLoad) return;
    if (checkForm(true) === false) {
      return;
    }
    let text = '';
    if (id) {
      text = chapterData.find(f => f.id === id)?.content || ''
    }
    let previousStorySummary = '';
    let characterRelationships = '';
    if (form?.synopsis !== 'customize') {
      const content = chapterData.find(f => f.id === +form?.synopsis)?.content || '';
      previousStorySummary = content;
    } else {
      previousStorySummary = form.synopsisCustomize;
    }

    if (form.character.length) {
      const characterList = await getCharacterListByParentId(+parentId);
      characterList.filter(f => form.character.includes(f.id!)).forEach(item => {
        characterRelationships += `
        ${t('roleName')}: ${item.name}
        ${t('describe')}: ${item.content} \n
        `
      })
    }
    try {
      setIsPlotLoad(true);
      const result = await generateFragmentedPlot({
        apiKey,
        modelName: tempModel || modelName,
        lang: locale,
        text,
        form: { ...form, characterRelationships },
        isSynopsis: true,
        generateQuantity,
        previousStorySummary
      })
      if (result?.data) {
        saveForm('fragmentedPlot', result?.data)
      } else if (result?.error) {
        if (result?.error?.err_code) {
          toast(() => (ErrorToast(result.error.err_code)))
        } else {
          toast(t('generateFailed'))
        }
      }
    } catch (error) {
      toast(t('generateFailed'))
    }
    setIsPlotLoad(false);
  }

  return (
    <div className="flex flex-col gap-7 w-full">
      <div className="flex items-center gap-3 px-5 pt-5 text-[#8e47f0] ">
        <div className="border border-[#8e47f0] rounded-lg p-2"><GiFeather /></div>
        {t('AIWriting')}
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto px-5 pb-5 h-[calc(100vh-163px)]" ref={scrollContainerRef} >

        {/* 片段剧情 */}
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {t('fragmented_Plot')}
              {tooltip('fragmentedPlot')}
              <MdTipsAndUpdates className='cursor-pointer text-[#8e47f0]' onClick={() => saveExample('fragmentedPlot')} />
            </div>
            {
              isPlotLoad ?
                <Loader2 className="h-[20px] w-[20px] animate-spin" /> :
                <>
                  {
                    (!generateQuantity || (generateQuantity && form?.chapterOrder > 1)) ?
                      <DropdownMenu>
                        <DropdownMenuTrigger className='outline-none'>
                          <FaWandMagicSparkles className="text-[#8e47f0]" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          {
                            chapterData.map(item => (
                              <DropdownMenuItem key={item.id} onClick={() => onGenerateFragmentedPlot(item.id!)}>
                                {item.name}
                              </DropdownMenuItem>
                            ))
                          }
                        </DropdownMenuContent>
                      </DropdownMenu> :
                      <div className="cursor-pointer no-drag" onClick={() => onGenerateFragmentedPlot()}>
                        <FaWandMagicSparkles className="text-[#8e47f0] cursor-pointer" />
                      </div>
                  }
                </>
            }
          </div>
          {
            example['fragmentedPlot'] &&
            <p className='whitespace-pre-line text-xs text-[#c16c47]'>
              {t('fragmentedPlot.Example')}
            </p>
          }
          <Textarea
            disabled={isLoad}
            value={form?.fragmentedPlot}
            className="min-h-[100px] no-drag"
            placeholder={t('fragmentedPlot_pla')}
            onChange={(e) => saveForm('fragmentedPlot', e.target.value)}
          />
        </div>

        {/* 写作要求 */}
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-2">
            {t('writing_Requirements')}
            {tooltip('writingRequirements')}
            <MdTipsAndUpdates className='cursor-pointer text-[#8e47f0]' onClick={() => saveExample('writingRequirements')} />
          </div>

          {
            example['writingRequirements'] &&
            <p className='whitespace-pre-line text-xs text-[#c16c47]'>
              {t('writingRequirements.Example')}
            </p>
          }

          <Textarea
            disabled={isLoad}
            value={form?.writingRequirements}
            className="min-h-[100px] no-drag"
            placeholder={t('writingRequirements_pla')}
            onChange={(e) => {
              saveForm('writingRequirements', e.target.value)
            }}
          />
        </div>

        {/* 人物角色 */}
        <Character />

        <div className="border rounded-lg p-2 flex flex-col gap-2">
          <div>{t('generateQuantity')}： <Switch id="chapterCount" checked={generateQuantity} onCheckedChange={setGenerateQuantity} /></div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="flex items-center justify-between gap-1 w-full">
              <div className="min-w-fit">{t('chapterCount')}：</div>
              <Input
                min={1}
                type='number'
                className="w-20"
                value={form?.chapterCount}
                disabled={!generateQuantity}
                onChange={(e) => saveForm('chapterCount', e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between gap-1 w-full">
              <div className="min-w-fit">{t('chapterOrder')}：</div>
              <Input
                min={1}
                type='number'
                className="w-20"
                value={form?.chapterOrder}
                disabled={!generateQuantity}
                onChange={(e) => saveForm('chapterOrder', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-[10px] border rounded-lg text-sm cursor-pointer" onClick={() => setExpandMore(!expandMore)}>
          {t('more')}
          {expandMore ? <BsChevronContract className="text-lg" /> : <BsChevronExpand className="text-lg" />}
        </div>

        <div className={`flex-col gap-5 ${expandMore && '!flex'} hidden`}>
          {/* 故事前情概要 */}
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2">{t('synopsis')} {tooltip('synopsis')}</div>
            {synopsisSelect()}
            {
              form?.synopsis === 'customize' && (
                <Textarea
                  disabled={isLoad}
                  value={form?.synopsisCustomize}
                  className="min-h-[100px] no-drag"
                  placeholder={t('customize_ pla')}
                  onChange={(e) => {
                    saveForm('synopsisCustomize', e.target.value)
                  }}
                />
              )
            }
          </div>

          {/* 故事背景 */}
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2">
              {t('character_relationships')}
              {tooltip('backgroundStory')}
              <MdTipsAndUpdates className='cursor-pointer text-[#8e47f0]' onClick={() => saveExample('backgroundStory')} />
            </div>
            {
              example['backgroundStory'] &&
              <p className='whitespace-pre-line text-xs text-[#c16c47]'>
                {t('characterRelationships.onExample')}
              </p>
            }
            <Textarea
              disabled={isLoad}
              value={form?.backgroundStory}
              className="min-h-[100px] no-drag"
              placeholder={t('characterRelationships pla')}
              onChange={(e) => {
                saveForm('backgroundStory', e.target.value)
              }}
            />
          </div>

          {/* 行文风格 */}
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2">
              {t('WritingStyle')}
              {tooltip('writingStyle')}
              <MdTipsAndUpdates className='cursor-pointer text-[#8e47f0]' onClick={() => saveExample('writingStyle')} />
            </div>
            {
              example['writingStyle'] &&
              <p className='whitespace-pre-line text-xs text-[#c16c47]'>
                {t('writingStyle.Example')}
              </p>
            }
            {writingStyleSelect()}
            {
              form?.writingStyle === 'customize' && (
                <Textarea
                  disabled={isLoad}
                  placeholder={t('customize_writingStyle_pla')}
                  value={form?.writingStyleCustomize}
                  className="min-h-[100px] no-drag"
                  onChange={(e) => { saveForm('writingStyleCustomize', e.target.value) }}
                />
              )
            }
          </div>

          {/* 前一片段 */}
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2">{t('previousClip')} {tooltip('previousClip')}</div>
            {previousClipSelect()}
            {
              form?.previousClip === 'customize' && (
                <Textarea
                  disabled={isLoad}
                  value={form?.previousClipCustomize}
                  className="min-h-[100px] no-drag"
                  placeholder={t('customize_ pla')}
                  onChange={(e) => {
                    saveForm('previousClipCustomize', e.target.value)
                  }}
                />
              )
            }
          </div>

          {/* 作品简介 */}
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2">
              {t('novel_introduction')}
              {tooltip('introduction')}
              <MdTipsAndUpdates className='cursor-pointer text-[#8e47f0]' onClick={() => saveExample('introduction')} />
            </div>

            {
              example['introduction'] &&
              <p className='whitespace-pre-line text-xs text-[#c16c47]'>
                {t('introduction.Example')}
              </p>
            }

            <Textarea
              disabled={isLoad}
              value={form?.introduction}
              className="min-h-[100px] no-drag"
              placeholder={t('introduction_pla')}
              onChange={(e) => {
                saveForm('introduction', e.target.value)
              }}
            />
          </div>
        </div>

        <Button onClick={() => { setIsLoad(true); onGenerateNovel('new') }} disabled={isLoad || isPlotLoad || isNextLoad}>
          {isLoad ? buildAction : t('generate')}
          {isLoad && <Loader2 className="h-[20px] w-[20px] animate-spin" />}
        </Button>

        {
          (form?.contentPlanning) && (
            <div className="flex flex-col gap-5">
              <div className="border rounded-lg py-3  text-sm">
                <div className="flex items-center justify-between gap-5 px-3">
                  <div>{t('new_chapter_content_planning')}</div>
                  <FaCopy className='cursor-pointer' onClick={onCopyCharacter} />
                </div>
                <MarkdownViewer content={form?.contentPlanning} className="no-drag max-h-[300px] overflow-y-auto px-3" />
              </div>
              <div className={`flex items-center ${startTiming ? 'justify-between' : 'justify-end'}`}>
                {startTiming && <Button onClick={() => setStartTiming(false)}><CiStop1 /></Button>}
                <Button onClick={() => { setIsNextLoad(true); onGenerateNovel('next'); }} disabled={isPlotLoad || isLoad || isNextLoad}>
                  {isNextLoad ? buildAction : t('start__immediately')}
                  {isNextLoad && <Loader2 className="h-[20px] w-[20px] animate-spin" />}
                </Button>
              </div>
              <p className={`text-end text-sm ${startTiming ? 'opacity-100' : 'opacity-0'}`}>{t('will_begin', { countdown })}</p>
            </div>
          )
        }
      </div>
    </div>
  )
}
