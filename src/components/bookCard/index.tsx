import JSZip from "jszip";
import { toast } from "sonner";
import { useAtom } from "jotai";
import { deleteData } from "./indexDB";
import { IBookCard } from "./interface";
import { userConfigAtom } from "@/stores";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { PiListBold } from "react-icons/pi";
import { Link, useRouter } from "@/i18n/routing";
import { useTool } from "@/hooks/global/use-tool";
import { useMonitorMessage } from "@/hooks/global/use-monitor-message";
import { getChapterListByParentId } from "@/app/[locale]/[id]/components/leftMenu/catalogue/indexDB";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const BookCard = (props: { book: IBookCard, onUpdate: () => void }) => {
  const { book, onUpdate } = props;

  const router = useRouter();
  const { formatTimeDiff } = useTool();
  const t = useTranslations('bookCard');
  const { handleDownload } = useMonitorMessage()
  const [{ moreSettingData }, setUserAtom] = useAtom(userConfigAtom);

  const [openDelAction, setOpenDelAction] = useState(false);

  const onOpenEdit = () => {
    if (book?.id) {
      router.push({ pathname: `/${book.id}` })
    }
  }

  const onDeleteWork = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDelAction(true)
  }

  const onUpdateWork = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    onUpdate()
  }

  const deleteAction = useMemo(() => {
    const onDeleteData = () => {
      if (book?.id) {
        deleteData(book.id).then((res) => {
          setUserAtom((v) => ({ ...v, bookshelf: res }))
          toast.success(t('delete_success'))
        }).catch((error) => {
          console.log(error);
          toast.warning(t('delete_warning'))
        })
      }
      setOpenDelAction(false)
    }

    return (
      <AlertDialog open={openDelAction} onOpenChange={setOpenDelAction}>
        <AlertDialogTrigger asChild />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete_works_title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('delete_works_description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteData}>{t('continue')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }, [openDelAction])

  const onProcessingText = (txt: string) => {
    return txt.split('\n').map((paragraph, index) => {
      if (moreSettingData.enableFirstLineIndent) {
        return `\t${paragraph}`;
      } else if (moreSettingData?.enableParagraphSpacing) {
        return `\n${paragraph}`;
      }
      return paragraph;
    }).join('\n').replace(/\n{2,}/g, '\n\n');
  }


  const onExportBook = () => {
    getChapterListByParentId(book.id!).then(async res => {
      if (!res || res.length < 1) {
        toast.warning(t('cannot_export'))
        return;
      }
      const zip = new JSZip();
      const filename = `《${book.name}》.zip`;
      res.forEach((item, index) => {
        const formattedContent = onProcessingText(item.content);
        const txtContent = `${item.name}\n\n${formattedContent}`;
        const txtName = `${item.name}.txt`;
        zip.file(txtName, txtContent);
      })
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      handleDownload(url, filename)
    }).catch((error) => {
      toast.warning(t('export_error'))
    })
  }

  return (
    <div className="w-[170px] h-fit cursor-pointer group" key={book.uuid}>
      <Link
        href={`/${book.id}`}
        onClick={onOpenEdit}
        style={{ backgroundImage: `url('${book.backcloth}')` }}
        className={`mb-2 block rounded-lg h-[230px] bg-cover shadow-[4px_4px_5px_0px_#00000038] relative book`}
      >
        <div className="flex-col rounded-lg items-center justify-center text-xs h-full hidden group-hover:flex backdrop-blur-sm bg-[#ffffff5c]">
          <p>{t('chapter')}: <span className="text-[#8e47f0]">{book.chapter}</span> {t('chap')}</p>
          <p>{t('word_count')}: <span className="text-[#8e47f0]">{book.wordage}</span> {t('character')}</p>
          {
            book.updatedAt &&
            <p>{t('last_modified')}: <span>{formatTimeDiff(book.updatedAt)}</span></p>
          }
        </div>
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1">{book.name}</p>
          <span className="text-xs text-slate-500">{book.author}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className='outline-none'>
            <PiListBold />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onOpenEdit}>
              <Link href={`/${book.id}`}>{t('open_work')}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onUpdateWork}>{t('edit_work')}</DropdownMenuItem>
            <DropdownMenuItem onClick={onExportBook}>{t('export_all')}</DropdownMenuItem>
            <DropdownMenuItem onClick={onDeleteWork}>{t('delete_work')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {deleteAction}
    </div >
  )
}
