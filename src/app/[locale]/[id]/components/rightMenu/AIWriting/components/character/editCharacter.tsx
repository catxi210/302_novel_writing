import { useTranslations } from 'next-intl'
import { useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useMemo, useState } from "react"
import { ICharacter } from "@/app/[locale]/[id]/interface"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RandomNaming } from '../randomNaming'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RiEdit2Fill } from 'react-icons/ri'

interface IProps {
  open: boolean,
  data: ICharacter | null,
  onClose: (open: boolean) => void,
  onOk: (data: ICharacter) => void,
}

export function EditCharacter(props: IProps) {
  const { open, data, onClose, onOk } = props;
  const { id: parentId }: { id: string } = useParams();
  const t = useTranslations('EditCharacter');
  const [randomNamingOpen, setRandomNamingOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    content: '',
    labelColor: '#ffffff',
  })

  const onSubmit = () => {
    onOk({
      ...data,
      ...form,
      parentId: +parentId,
    })
  }

  const onOpenChange = (open: boolean) => {
    if (!open) {
      onClose(false);
    }
  }

  const saveForm = (key: string, value: string) => {
    setForm((v) => ({ ...v, [key]: value }))

  }

  const InputColor = useMemo(() => {
    return (
      <Input
        type='color'
        className="w-[60px]"
        value={form.labelColor}
        onChange={(e) => saveForm('labelColor', e.target.value)}
      />
    )
  }, [form.labelColor])

  useEffect(() => {
    if (open && data) {
      setForm({ ...data })
    } else {
      setForm({
        name: '',
        content: '',
        labelColor: '#ffffff',
      })
    }
  }, [open, data])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild />
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-5">
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-2">
                  <div className="min-w-fit">{t('characterName')}</div>
                  <Input
                    value={form.name}
                    className="no-drag"
                    placeholder={t('enterCharacterName')}
                    onChange={(e) => saveForm('name', e.target.value)}
                  />
                </div>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant='icon' size='icon' className="!w-auto !h-auto !border-none" onClick={() => setRandomNamingOpen(true)}>
                        <RiEdit2Fill />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[250px]">{t('character_useAIRandomName')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2">
                <div className="min-w-fit">{t('label')}</div>
                {InputColor}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="min-w-fit">{t('description')}</div>
              <Textarea
                value={form.content}
                className="min-h-[100px] no-drag"
                placeholder={t('enterCharacterDescription')}
                onChange={(e) => saveForm('content', e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={onSubmit} disabled={!form.name?.trim()?.length}>{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <RandomNaming open={randomNamingOpen} onClose={setRandomNamingOpen} />
    </>
  )
}
