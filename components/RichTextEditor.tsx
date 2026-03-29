'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@arco-design/web-react'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Code, 
  Quote, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Undo,
  Redo
} from 'lucide-react'
import styles from './RichTextEditor.module.css'

interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function RichTextEditor({ 
  value = '', 
  onChange, 
  placeholder = '请输入内容...',
  disabled = false 
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-inside',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-inside',
          },
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  const addImage = () => {
    const url = window.prompt('请输入图片 URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = () => {
    const url = window.prompt('请输入链接 URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className={styles.editorWrapper}>
      {!disabled && (
        <div className={styles.toolbar}>
          <Button
            type="text"
            size="small"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? styles.activeBtn : ''}
          >
            <Bold size={16} />
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? styles.activeBtn : ''}
          >
            <Italic size={16} />
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? styles.activeBtn : ''}
          >
            <UnderlineIcon size={16} />
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? styles.activeBtn : ''}
          >
            <Strikethrough size={16} />
          </Button>
          
          <div className={styles.divider} />
          
          <Button
            type="text"
            size="small"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? styles.activeBtn : ''}
          >
            <List size={16} />
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? styles.activeBtn : ''}
          >
            <ListOrdered size={16} />
          </Button>
          
          <div className={styles.divider} />
          
          <Button
            type="text"
            size="small"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? styles.activeBtn : ''}
          >
            <AlignLeft size={16} />
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? styles.activeBtn : ''}
          >
            <AlignCenter size={16} />
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? styles.activeBtn : ''}
          >
            <AlignRight size={16} />
          </Button>
          
          <div className={styles.divider} />
          
          <Button
            type="text"
            size="small"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? styles.activeBtn : ''}
          >
            <Quote size={16} />
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive('code') ? styles.activeBtn : ''}
          >
            <Code size={16} />
          </Button>
          
          <div className={styles.divider} />
          
          <Button
            type="text"
            size="small"
            onClick={addLink}
            className={editor.isActive('link') ? styles.activeBtn : ''}
          >
            <LinkIcon size={16} />
          </Button>
          <Button
            type="text"
            size="small"
            onClick={addImage}
          >
            <ImageIcon size={16} />
          </Button>
          
          <div className={styles.divider} />
          
          <Button
            type="text"
            size="small"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo size={16} />
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo size={16} />
          </Button>
        </div>
      )}
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  )
}
