import { useAtom } from "jotai";
import { useEffect } from "react";
import { userConfigAtom } from "@/stores";
import { IDomEditor, SlateTransforms } from "@wangeditor/editor";

export const useEditor = () => {
  const editorRef: IDomEditor = (window as any).globalEditorRef;
  
  const [{ layoutData, moreSettingData, themeData, fontData }] = useAtom(userConfigAtom);

  useEffect(() => {
    const setMargins = () => {
      if (editorRef) {
        const editorDom = editorRef?.getEditableContainer();
        if (editorDom) {
          const targetNode = editorDom.querySelector('.w-e-text-container [data-slate-editor]') as HTMLElement | null;
          const placeholder = editorDom.querySelector('.w-e-text-placeholder') as HTMLElement | null;
          if (targetNode) {
            targetNode.style.padding = `0 ${layoutData.sideMargin}px ${layoutData.bottomSpacing}px ${layoutData.sideMargin}px`;
            targetNode.style.letterSpacing = `${layoutData.letterSpacing}px`;
          }
          if (placeholder) {
            placeholder.style.left = `${layoutData.sideMargin}px`
          }
        }
      }
    }

    const setLineSpacing = () => {
      if (editorRef) {
        editorRef.selectAll();
        SlateTransforms.setNodes(editorRef, {
          // @ts-ignore
          lineHeight: `${layoutData.lineHeight}`,
        }, {
          mode: 'highest',
        })
        editorRef.deselect()
      }
    }

    if (editorRef) {
      setMargins()
      setLineSpacing()
    }
  }, [layoutData, editorRef])

  useEffect(() => {
    const setMargins = () => {
      if (editorRef) {
        const editorDom = editorRef?.getEditableContainer();
        if (editorDom) {
          const placeholder = editorDom.querySelector('.w-e-text-placeholder') as HTMLElement | null;
          if (placeholder) {
            placeholder.style.top = moreSettingData?.enableParagraphSpacing ? '17px' : '2px'
          }
        }
      }
    }

    const setFirstLineIndentation = () => {
      if (editorRef) {
        const editorDom = editorRef?.getEditableContainer();
        if (editorDom) {
          const placeholder = editorDom.querySelector('.w-e-text-placeholder') as HTMLElement | null;
          if (placeholder) {
            placeholder.style.left = moreSettingData?.enableFirstLineIndent ? '42px' : '10px'
          }
        }
      }
    }

    if (editorRef) {
      setMargins();
      setFirstLineIndentation();
    }
  }, [editorRef, moreSettingData])

  useEffect(() => {
    if (editorRef) {
      const editorDom = editorRef?.getEditableContainer();
      if (editorDom) {
        const targetNode = editorDom.querySelector('.w-e-text-container [data-slate-editor]') as HTMLElement | null;
        const placeholder = editorDom.querySelector('.w-e-text-placeholder') as HTMLElement | null;
        if (targetNode) {
          targetNode.style.fontFamily = fontData.font;
          targetNode.style.fontSize = fontData.fontSize;
          targetNode.style.color = fontData.textColor;
          targetNode.style.fontWeight = fontData.bold ? 'bold' : 'unset';
          targetNode.style.fontStyle = fontData.italic ? 'italic' : 'unset';
          targetNode.style.textDecoration = fontData.underline ? 'underline' : 'unset';
        }
        if (placeholder) {
          placeholder.style.color = fontData.textColor
        }
      }
    }
  }, [editorRef, fontData])

  useEffect(() => {
    if (editorRef) {
      const editorDom = editorRef?.getEditableContainer();
      const scrollDom = editorDom.querySelector('.w-e-scroll') as HTMLElement | null;
      if (scrollDom) {
        if (themeData.paperType === 'none') {
          scrollDom.style.backgroundImage = 'unset'
        } else if (themeData.backgroundImage && themeData.paperType === 'back') {
          scrollDom.style.backgroundImage = `url(${themeData.backgroundImage})`;
          scrollDom.style.backgroundBlendMode = 'unset';
        } else if (themeData.paper && themeData.paperType === 'paper') {
          scrollDom.style.backgroundImage = `url(${themeData.paper})`;
          scrollDom.style.backgroundBlendMode = 'luminosity';
        }
        scrollDom.style.backgroundColor = themeData.themeColor;
        scrollDom.style.backgroundPositionY = '-48px';
      }
    }
  }, [themeData, editorRef])

  useEffect(() => {
    if (editorRef && moreSettingData?.scrollToBottomOnOpen) {
      const editorDom = editorRef?.getEditableContainer();
      const scrollDom = editorDom.querySelector('.w-e-scroll') as HTMLElement | null;
      if (scrollDom) {
        scrollDom.scrollTop = scrollDom.scrollHeight;
      }
    }
  }, [editorRef])

}