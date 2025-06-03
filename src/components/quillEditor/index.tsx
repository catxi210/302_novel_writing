import { useAtom } from 'jotai';
import 'react-quill/dist/quill.snow.css';
import { userConfigAtom } from '@/stores';
import { deltaToObject } from '@/lib/utils';
import ReactQuill, { UnprivilegedEditor } from 'react-quill';
import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface IQuillEditor {
  id: number | string;
  value: string;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function QuillEditor(props: IQuillEditor) {
  const t = useTranslations();
  const { id, className, placeholder, onChange, value, readOnly = false } = props;

  const quillRef = useRef<ReactQuill>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [setyls, setStyles] = useState<CSSProperties>({});
  const oldValue = useRef('')

  const [{ layoutData, moreSettingData, fontData }, setUserAtom] = useAtom(userConfigAtom);

  const getClassName = () => {
    return `${className}
     ${moreSettingData?.enableFirstLineIndent && 'quill_indent ql-placeholder'}`
  }

  useEffect(() => {
    setStyles((v) => ({
      ...v,
      padding: `10px ${layoutData.sideMargin}px ${layoutData.bottomSpacing}px ${layoutData.sideMargin}px`,
      letterSpacing: `${layoutData.letterSpacing}px`,
      lineHeight: `${layoutData.lineHeight}`
    }))
  }, [layoutData])

  useEffect(() => {
    setStyles((v) => ({
      ...v,
      fontFamily: fontData.font,
      fontSize: fontData.fontSize,
      color: fontData.textColor,
      fontWeight: fontData.bold ? 'bold' : 'unset',
      fontStyle: fontData.italic ? 'italic' : 'unset',
      textDecoration: fontData.underline ? 'underline' : 'unset',
    }))
  }, [fontData])

  useEffect(() => {
    if (quillRef.current) {
      (window as any).globalQuillRef = quillRef.current;
      quillRef.current.getEditor().root.dataset.placeholder = placeholder || t('quill_placeholder');
    }
  }, [quillRef, placeholder]);

  // useEffect(() => {
  //   if (undo || redo) {
  //     if (quillRef.current) {
  //       const editor = quillRef.current?.getEditor();
  //       if (editor) {
  //         if (undo) {
  //           // @ts-ignore
  //           editor?.history.undo();
  //         }
  //         if (redo) {
  //           // @ts-ignore
  //           editor?.history.redo();
  //         }
  //         setUserAtom((v) => ({ ...v, undo: false, redo: false }))
  //       }
  //     }
  //   }
  // }, [undo, redo])

  useEffect(() => {
    if (!moreSettingData?.scrollToBottomOnOpen) return;
    const scrollToBottom = () => {
      const editorInstance = quillRef.current?.getEditor();
      if (editorInstance) {
        const editorContent = editorInstance.root;
        if (editorContent) {
          editorContent.scrollTop = editorContent.scrollHeight;
        }
      }
    };

    scrollToBottom();

    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [value]);

  useEffect(() => {
    return () => {
      delete (window as any).globalEditorRef;
    }
  }, [])

  useEffect(() => {
    if (quillRef.current) {
      oldValue.current = value || ''
      quillRef.current.getEditor().setText(value || '');
      // @ts-ignore
      quillRef.current.getEditor().history.clear();
    }
  }, [value, id])

  useEffect(() => {
    (window as any).globalEditorRef = quillRef.current;
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // 确保 Quill 实例已加载
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.root.addEventListener('paste', (e) => {
        e.preventDefault();
        if (e.clipboardData) {
          const text = e.clipboardData.getData('text/plain');
          const range = quill.getSelection(true); // 获取当前选区

          // 清除选区范围内的原有内容
          if (range && range.length > 0) {
            quill.deleteText(range.index, range.length);
          }

          setTimeout(() => {
            quill.insertText(range.index, text, 'silent'); // 插入纯文本
          }, 10);

          // 将光标移动到插入内容的末尾
          setTimeout(() => {
            quill.setSelection(range.index + text.length, 0, 'silent');
          }, 15);
        }
      });
    }
  }, []);

  const onCountWord = (delta: any) => {
    setUserAtom((v) => {
      let length = v.typingLength || 0;
      let dayTypingLength = v.dayTypingLength || 0;
      if (delta.ops) {
        const deltaData = deltaToObject(delta.ops);
        if (deltaData?.insert === '\n' && !deltaData?.delete && moreSettingData.enableParagraphSpacing) {
          setTimeout(() => {
            quillRef?.current?.getEditor().insertText(deltaData.retain + 1, '\n', 'silent');
          }, 10)
        }
        // 先处理删除的
        if (deltaData?.delete) {
          // 取出删除的数据
          const retain = deltaData?.retain || 0;
          const deleteData = oldValue.current.slice(retain, deltaData.delete + retain)?.replace(/\s+/g, "");
          console.log('deleteData', deleteData.length);
          length = deleteData.length > length ? 0 : length - deleteData.length;
          if (deleteData.length > dayTypingLength) {
            console.log(deleteData.length, dayTypingLength, v.oldDayTypingLength, v.typingLength);
            dayTypingLength = deleteData.length - dayTypingLength < v.oldDayTypingLength ? v.oldDayTypingLength : dayTypingLength - v.typingLength;
          } else {
            const temp = dayTypingLength - deleteData.length;
            dayTypingLength = temp < v.oldDayTypingLength ? v.oldDayTypingLength : temp;
          }
        }
        if (deltaData?.insert) {
          const insertTxt = deltaData.insert?.replace(/\s+/g, "")
          length = length + insertTxt.length;
          dayTypingLength = dayTypingLength + insertTxt.length;
        }
      }
      return {
        ...v,
        typingLength: length,
        dayTypingLength,
      }
    })
  }

  return (
    <ReactQuill
      id={`${id}`}
      ref={quillRef}
      theme="bubble"
      readOnly={readOnly}
      style={{ ...setyls, }}
      className={getClassName()}
      onChange={(values: string, delta: any, source: any, editor: UnprivilegedEditor) => {
        (window as any).globalEditorRef = quillRef.current;
        if (source === 'user' || source === 'silent') {
          if (timerRef?.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (source === 'user') {
            onCountWord(delta);
          }

          setUserAtom((v) => ({ ...v, typing: true, isFreeTime: false }))
          const txt = editor.getText();
          oldValue.current = txt;
          if (txt.trim().length > 0) {
            onChange(txt.replace(/\n+$/, ''));
          } else {
            onChange('')
          }
          timerRef.current = setTimeout(() => {
            setUserAtom((v) => ({ ...v, typing: false, isFreeTime: true }))
          }, 2000);
        }
      }}
      modules={{
        toolbar: false,
      }}
    />
  )
}
