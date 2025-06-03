import { toast } from "sonner"
import { useAtom } from "jotai"
import { FaCopy } from "react-icons/fa"
import { IoClose } from "react-icons/io5"
import { userConfigAtom } from "@/stores"
import { IconType } from "react-icons/lib"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { RandomNaming } from "../randomNaming"
import { IoMdPersonAdd } from "react-icons/io"
import { Button } from "@/components/ui/button"
import { EditCharacter } from "./editCharacter"
import { BsPatchQuestion } from "react-icons/bs"
import { MdTipsAndUpdates } from "react-icons/md"
import { Checkbox } from "@/components/ui/checkbox"
import { ICharacter } from "@/app/[locale]/[id]/interface"
import { RiEdit2Fill, RiEditBoxLine } from "react-icons/ri"
import { getConstants } from "@/app/[locale]/[id]/constants"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { deleteCharacter, getCharacterListByParentId, saveCharacter, updateCharacter } from "./indexDB"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export const Character = () => {
  const t = useTranslations();
  const { AIWRITINGFORMTIPS } = getConstants(t);
  const { id: parentId }: { id: string } = useParams();

  const [{ writingForm }, setUserAtom] = useAtom(userConfigAtom);

  const [example, setExample] = useState(false)
  const [open, setOpen] = useState(false);
  const [characterOpen, setCharacterOpen] = useState(false);


  const [editData, setEditData] = useState<ICharacter | null>(null)
  const [characterData, setCharacterData] = useState<ICharacter[]>([]);

  const cucurrentWritingForm = writingForm[parentId];

  const onOK = (data: ICharacter) => {
    if (data?.id) {
      updateCharacter(data.id, { ...data }).then(res => {
        setCharacterData(res);

        setEditData(null);
        setCharacterOpen(false);
      }).catch(error => {
        toast.error(t('updateCharacterFailed'))
      })
    } else {
      saveCharacter({ ...data }).then(res => {
        setCharacterData(res);
        setCharacterOpen(false);
      }).catch(error => {
        toast.error(t('addCharacterFailed'))
      })
    }
  }

  const onCheckedChange = (item: ICharacter) => {
    setUserAtom((v) => {
      let tempCharacter = v.writingForm?.[parentId]?.character || [];
      if (cucurrentWritingForm.character?.includes(item.id!)) {
        tempCharacter = cucurrentWritingForm.character.filter(f => f !== item.id)
      } else {
        tempCharacter.push(item.id!)
      }
      return {
        ...v,
        writingForm: {
          ...v.writingForm,
          [parentId]: {
            ...cucurrentWritingForm,
            character: tempCharacter
          }
        }
      }
    })
  }

  const onCopyCharacter = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      toast.success(t('copy_success'))
    } catch (err) {
      toast.error(t('copy_error'))
    }
  };

  const onDeleteCharacter = (item: ICharacter) => {
    deleteCharacter(item.id!, item.parentId).then(res => {
      setCharacterData(res);
      setUserAtom((v) => {
        const tempCharacter = cucurrentWritingForm?.character?.filter(f => f !== item.id) || []
        return {
          ...v,
          writingForm: {
            ...v.writingForm,
            [parentId]: {
              ...cucurrentWritingForm,
              character: tempCharacter
            }
          }
        }
      })
    }).catch(error => {
      toast.error(t('catalogue.delete_error'))
    })
  }

  const tooltip = (content: string, Icon: IconType, type?: 'editCharacter' | 'randomNaming') => {

    const onClick = () => {
      if (type === 'editCharacter') {
        setCharacterOpen(true);
      }
      // if (type === 'randomNaming') {
      //   setRandomNamingOpen(true)
      // }
    }

    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='icon' size='icon' className="!w-auto !h-auto !border-none" onClick={onClick}>
              <Icon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-[250px]">{content}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  useEffect(() => {
    getCharacterListByParentId(+parentId).then(res => {
      setCharacterData(res);
      setUserAtom((v) => {
        return {
          ...v,
          writingForm: {
            ...v?.writingForm,
            [parentId]: {
              ...v.writingForm[parentId],
              character: res.map(item => item.id!) || []
            }
          }
        }
      })
    })
  }, [parentId])

  useEffect(() => {
    if (!characterOpen) {
      setEditData(null)
    }
  }, [characterOpen])

  useEffect(() => {
    if (open) {
      getCharacterListByParentId(+parentId).then(res => {
        setCharacterData(res);
      })
    }
  }, [open])

  return (
    <div className="grid grid-cols-1 gap-2 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {t('character')}
          {tooltip(AIWRITINGFORMTIPS['character'], BsPatchQuestion)}
          <MdTipsAndUpdates className='cursor-pointer text-[#8e47f0]' onClick={() => setExample((v) => !v)} />
        </div>
        <div className="flex items-center gap-3">
          {tooltip(t('character_newCharacter'), IoMdPersonAdd, 'editCharacter')}
        </div>
      </div>

      {
        example &&
        <p className='whitespace-pre-line text-xs text-[#c16c47]'>
          {t('character_example')}
        </p>
      }

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild className="w-full">
          <Button variant="outline">
            {t('character_selectedCount', { count: cucurrentWritingForm?.character?.length || 0 })}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[300px] max-h-[40vh] overflow-y-auto">
          <DropdownMenuGroup className="flex flex-col gap-1">
            {
              characterData.length ?
                characterData.map(item => (
                  <DropdownMenuItem style={{ backgroundColor: item.labelColor }} key={`${item.id}`}>
                    <div className="flex items-center justify-between w-full gap-5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-5 cursor-pointer">
                        <Checkbox
                          id={`${item.id}`}
                          onCheckedChange={() => onCheckedChange(item)}
                          checked={cucurrentWritingForm?.character?.includes(item.id!)}
                        />
                        <label className="no-drag" htmlFor={`${item.id}`}>{item.name}</label>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaCopy
                          className='cursor-pointer'
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onCopyCharacter(item.name)
                          }}
                        />
                        <RiEditBoxLine
                          className='cursor-pointer text-[17px] text-[#8e47f0]'
                          onClick={() => {
                            setCharacterOpen(true);
                            setEditData(item)
                          }}
                        />
                        <IoClose className="text-red-600 text-[20px] cursor-pointer" onClick={() => onDeleteCharacter(item)} />
                      </div>
                    </div>
                  </DropdownMenuItem>
                )) :
                <img src="/images/global/empty.png" className="w-10/12 mx-auto" alt={t('NoContent')} />
            }
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditCharacter onOk={onOK} open={characterOpen} onClose={setCharacterOpen} data={editData} />
    </div>
  )
}
