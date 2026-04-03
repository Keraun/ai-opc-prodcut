'use client'

import { useState } from 'react'
import { Button } from '@arco-design/web-react'
import { 
  Bold, 
  Italic, 
  Code, 
  Quote, 
  List, 
  ListOrdered, 
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react'
import styles from './MarkdownEditor.module.css'

interface MarkdownEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function MarkdownEditor({ 
  value = '', 
  onChange, 
  placeholder = '请输入 Markdown 内容...',
  disabled = false 
}: MarkdownEditorProps) {
  const [editorValue, setEditorValue] = useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setEditorValue(newValue)
    onChange?.(newValue)
  }

  const insertMarkdown = (before: string, after: string) => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = editorValue.substring(start, end)
    const newValue = editorValue.substring(0, start) + before + selectedText + after + editorValue.substring(end)

    setEditorValue(newValue)
    onChange?.(newValue)

    // 聚焦并设置光标位置
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length + selectedText.length, start + before.length + selectedText.length)
    }, 0)
  }

  return (
    <div className={styles.editorWrapper}>
      {!disabled && (
        <div className={styles.toolbar}>
          <Button
            type="text"
            size="small"
            onClick={() => insertMarkdown('**', '**')}
          >
            <Bold size={16} />
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => insertMarkdown('*', '*')}
          >
            <Italic size={16} />
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => insertMarkdown('`', '`')}
          >
            <Code size={16} />
          </Button>
          
          <div className={styles.divider} />
          
          <Button
            type="text"
            size="small"
            onClick={() => insertMarkdown('\n- ', '')}
          >
            <List size={16} />
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => insertMarkdown('\n1. ', '')}
          >
            <ListOrdered size={16} />
          </Button>
          
          <div className={styles.divider} />
          
          <Button
            type="text"
            size="small"
            onClick={() => insertMarkdown('\n> ', '')}
          >
            <Quote size={16} />
          </Button>
          
          <div className={styles.divider} />
          
          <Button
            type="text"
            size="small"
            onClick={() => insertMarkdown('[链接文本](', ')')}
          >
            <LinkIcon size={16} />
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => insertMarkdown('![图片描述](', ')')}
          >
            <ImageIcon size={16} />
          </Button>
        </div>
      )}
      <textarea
        id="markdown-editor"
        value={editorValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={styles.editorContent}
        rows={10}
      />
      <div className={styles.hint}>
        支持 Markdown 语法，例如：**粗体**、*斜体*、`代码`、[链接](url)、![图片](url) 等
      </div>
    </div>
  )
}
