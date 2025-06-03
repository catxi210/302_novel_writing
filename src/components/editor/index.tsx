import '@wangeditor/editor/dist/css/style.css' // 引入 css

import { useEditor } from '@/hooks/global/use-editor'
import React, { useState, useEffect, useRef } from 'react'
import { Editor as WangEditor } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

interface IEditor {
  id: number;
  value: string;
  className: string
  style?: React.CSSProperties;
  onChange: (value: string, id: number) => void;
}

export const Editor = (props: IEditor) => {
  useEditor()
  const editorRef = useRef<IDomEditor | null>(null);

  const { id, className, value, style, onChange } = props;

  const [editor, setEditor] = useState<IDomEditor | null>(null);

  // 工具栏配置
  const toolbarConfig: Partial<IToolbarConfig> = {}

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: '请输入内容...',
  }

  const onCreated = ((e: IDomEditor) => {
    editorRef.current = e;
    setEditor(e);
    (window as any).globalEditorRef = e;
  })

  useEffect(() => {
    return () => {
      if (editor == null) return
      editor.destroy()
      setEditor(null)
      editorRef.current = null;
      delete (window as any).globalEditorRef;
    }
  }, [editor])
// console.log();

  return (
    <WangEditor
      key={id}
      mode='simple'
      value={value}
      style={{ ...style }}
      onCreated={onCreated}
      className={`${className}`}
      defaultConfig={editorConfig}
      onChange={(editor) => {
        onChange(editor.getText(), id);
        // onCreated(editor)
      }}
    />
  )
};
