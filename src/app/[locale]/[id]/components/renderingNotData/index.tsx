import { useAtom } from "jotai";
import { userConfigAtom } from "@/stores";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getOneBookshelf } from "@/components/bookCard/indexDB";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export const RenderingNotData = () => {
  const t = useTranslations();
  const router = useRouter();
  const { id: parentId }: { id: string } = useParams();

  const [{ }, setUserAtom] = useAtom(userConfigAtom);

  const [countdown, setCountdown] = useState(3);
  const [openNotData, setOpenNotData] = useState(false);

  useEffect(() => {
    if (openNotData && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      router.replace('/');
    }
  }, [openNotData, countdown, router]);

  useEffect(() => {
    if (parentId) {
      getOneBookshelf(+parentId).then(res => {
        if (res) {
          setUserAtom((v) => ({
            ...v,
            bookName: res.name,
            opneRightMenu: 'aiWriting',
            writingForm: {
              ...v.writingForm,
              [parentId]: {
                ...v.writingForm[parentId],
                introduction: res?.introduction || '',
              }
            }
          }))
        } else {
          setUserAtom((v) => ({ ...v, bookName: '' }))
          setOpenNotData(true);
        }
      })
    }
  }, [parentId])

  return (
    <AlertDialog open={openNotData}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('novelNotExist')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('currentNovelDoesNotExist')}
            {t('redirectingToHomepageIn', { seconds: countdown })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => router.replace('/')}>{t('returnImmediately')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}