import "cropperjs/dist/cropper.css";

import { toast } from "sonner";
import { v4 as uuidV4 } from 'uuid'
import { Loader2 } from "lucide-react";
import { uploadFile } from "@/api/upload";
import { base64ToFile } from "@/lib/utils";
import { useTranslations } from "next-intl";
import React, { createRef, useState } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface IProps {
  src: string;
  open: boolean;
  onOk: (src: string) => void;
  onClose: () => void;
}
export const CropperImage = (props: IProps) => {
  const t = useTranslations();
  const { open, src, onClose, onOk } = props;

  const cropperRef = createRef<ReactCropperElement>();
  const [load, setLoad] = useState(false)

  const getCropData = async () => {
    setLoad(true)
    if (typeof cropperRef.current?.cropper !== "undefined") {
      try {
        const base64Str = cropperRef.current?.cropper.getCroppedCanvas().toDataURL();
        if (base64Str) {
          const file = base64ToFile(base64Str, uuidV4());
          if (file) {
            const imageResult: any = await uploadFile(file);
            if (!imageResult?.data?.url) {
              toast.error(t('upload_error'))
            }
            const imgUrl = imageResult.data.url;
            onOk(imgUrl);
            onClose()
          }
        }
      } catch (error) {
        console.error('CropperImage====>>>>error', error);
        toast.error(t('upload_error'))
      }
    }
    setLoad(false)
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogTrigger asChild />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle />
          <AlertDialogDescription />
        </AlertDialogHeader>
        <div style={{ width: "100%" }}>
          <Cropper
            src={src}
            zoomTo={0}
            viewMode={1}
            guides={true}
            ref={cropperRef}
            autoCropArea={1}
            background={true}
            responsive={true}
            dragMode={'move'}
            minCropBoxWidth={200}
            minCropBoxHeight={300}
            checkOrientation={false}
            cropBoxResizable={false}
            initialAspectRatio={2 / 3}
            toggleDragModeOnDblclick={false}
            style={{ height: 300, width: "100%" }}
            ready={() => {
              cropperRef.current?.cropper.setCropBoxData({ width: 200, height: 300 })
            }}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={load} onClick={() => onClose()}>{t('bookCard.cancel')}</AlertDialogCancel>
          <AlertDialogAction disabled={load} onClick={getCropData}>
            {t('bookCard.continue')}
            {load && <Loader2 className="w-[20px] h-[20px] animate-spin" />}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

  );
};

export default CropperImage;
