"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  ArrowLeft,
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Save,
  X,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Underline as UnderlineIcon
} from "lucide-react"
import { toast } from "sonner"
import { Tooltip, Modal, Input, Button } from '@arco-design/web-react'
import { ManagementHeader } from './ManagementHeader'
import { CommonTable, ActionButton } from './CommonTable'
import { useConfig } from '../common/hooks/useConfig'
import styles from "./BaseManagement.module.css"

export interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'select-with-input' | 'richtext' | 'tags' | 'status-button' | 'image'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  dynamicOptions?: boolean
  optionsEndpoint?: string
  actionButton?: {
    text: string
    onClick: () => void
  }
  rows?: number
  icon?: React.ReactNode
  inlineGroup?: string
  hint?: string
  maxLength?: number
}

export interface ColumnConfig {
  key: string
  label: string
  render?: (item: any) => React.ReactNode
  width?: string
}

export interface StatusConfig {
  field: string
  states: {
    value: string
    label: string
    action: string
    type: 'success' | 'warning' | 'default'
  }[]
}

export interface ManagementConfig {
  title: string
  apiEndpoint: string
  fields: FieldConfig[]
  columns: ColumnConfig[]
  emptyIcon: React.ReactNode
  emptyText: string
  description?: string
  statusConfig?: StatusConfig
  actionsColumnWidth?: number
}

interface BaseManagementProps {
  config: ManagementConfig
}

type ViewMode = 'list' | 'new' | 'edit' | 'view'

function RichTextEditor({ 
  value, 
  onChange,
  placeholder = "请输入内容..."
}: { 
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [linkModalVisible, setLinkModalVisible] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload?quality=85', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (result.success && result.url) {
        editor?.chain().focus().setImage({ src: result.url }).run()
        toast.success(`图片上传成功，节省 ${result.savedPercentage}% 空间`)
      } else {
        toast.error(result.message || '图片上传失败')
      }
    } catch (error) {
      console.error('Image upload error:', error)
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        editor?.chain().focus().setImage({ src: base64 }).run()
      }
      reader.readAsDataURL(file)
      toast.success('图片已插入（Base64格式）')
    }
  }, [editor])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('图片大小不能超过5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('请选择图片文件')
        return
      }
      handleImageUpload(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleImageUpload])

  const addLink = useCallback(() => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setLinkModalVisible(false)
    }
  }, [editor, linkUrl])

  if (!editor) {
    return null
  }

  return (
    <div className={styles.editor}>
      <div className={styles.editorToolbar}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${styles.toolbarButton} ${editor.isActive('bold') ? styles.toolbarButtonActive : ''}`}
          title="粗体"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${styles.toolbarButton} ${editor.isActive('italic') ? styles.toolbarButtonActive : ''}`}
          title="斜体"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${styles.toolbarButton} ${editor.isActive('underline') ? styles.toolbarButtonActive : ''}`}
          title="下划线"
        >
          <UnderlineIcon size={16} />
        </button>
        <div className={styles.toolbarDivider} />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${styles.toolbarButton} ${editor.isActive('bulletList') ? styles.toolbarButtonActive : ''}`}
          title="无序列表"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${styles.toolbarButton} ${editor.isActive('orderedList') ? styles.toolbarButtonActive : ''}`}
          title="有序列表"
        >
          <ListOrdered size={16} />
        </button>
        <div className={styles.toolbarDivider} />
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'left' }) ? styles.toolbarButtonActive : ''}`}
          title="左对齐"
        >
          <AlignLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'center' }) ? styles.toolbarButtonActive : ''}`}
          title="居中"
        >
          <AlignCenter size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'right' }) ? styles.toolbarButtonActive : ''}`}
          title="右对齐"
        >
          <AlignRight size={16} />
        </button>
        <div className={styles.toolbarDivider} />
        <button
          type="button"
          onClick={() => setLinkModalVisible(true)}
          className={`${styles.toolbarButton} ${editor.isActive('link') ? styles.toolbarButtonActive : ''}`}
          title="插入链接"
        >
          <LinkIcon size={16} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={styles.toolbarButton}
          title="插入图片"
        >
          <ImageIcon size={16} />
        </button>
      </div>
      <EditorContent editor={editor} className={styles.editorContent} />
      
      <Modal
        title="插入链接"
        visible={linkModalVisible}
        onCancel={() => {
          setLinkModalVisible(false)
          setLinkUrl('')
        }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => {
              setLinkModalVisible(false)
              setLinkUrl('')
            }}>取消</Button>
            <Button type="primary" onClick={addLink}>确定</Button>
          </div>
        }
      >
        <div style={{ padding: '16px 0' }}>
          <Input
            placeholder="请输入链接地址"
            value={linkUrl}
            onChange={setLinkUrl}
            onPressEnter={addLink}
          />
        </div>
      </Modal>
    </div>
  )
}

function FormField({ 
  field, 
  value, 
  onChange 
}: { 
  field: FieldConfig
  value: any
  onChange: (value: any) => void 
}) {
  const [tagInput, setTagInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddTag = () => {
    if (tagInput.trim() && !value?.includes(tagInput.trim())) {
      onChange([...(value || []), tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    onChange(value?.filter((t: string) => t !== tag) || [])
  }

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload?quality=85', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (result.success && result.url) {
        onChange(result.url)
        toast.success('图片上传成功')
      } else {
        toast.error(result.message || '图片上传失败')
      }
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('图片上传失败')
    }
  }

  const handleGenerateRandomImage = () => {
    // 使用 picsum.photos 生成随机图片
    const randomWidth = 800
    const randomHeight = 600
    const randomId = Math.floor(Math.random() * 1000)
    const randomImageUrl = `https://picsum.photos/id/${randomId}/${randomWidth}/${randomHeight}`
    onChange(randomImageUrl)
    toast.success('随机主图生成成功')
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('图片大小不能超过5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('请选择图片文件')
        return
      }
      handleImageUpload(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`${styles.formGroup} ${field.type === 'richtext' ? styles.formGroupRichtext : ''} ${field.type === 'image' ? styles.formGroupImage : ''} ${field.inlineGroup ? styles.formGroupInline : ''}`}>
      {!field.inlineGroup && (
        <label className={styles.label}>
          {field.icon}
          {field.label} {field.required && '*'}
        </label>
      )}
      
      {field.type === 'text' && (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
          className={styles.input}
          placeholder={field.placeholder}
        />
      )}
      
      {field.type === 'textarea' && (
        <div style={{ position: 'relative', width: '100%' }}>
          <textarea
            value={value || ''}
            onChange={(e) => {
              const newValue = e.target.value
              if (field.maxLength && newValue.length > field.maxLength) {
                onChange(newValue.substring(0, field.maxLength))
              } else {
                onChange(newValue)
              }
            }}
            onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
            className={styles.textarea}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            style={{ 
              minHeight: '160px',
              paddingRight: field.maxLength ? '80px' : undefined
            }}
            maxLength={field.maxLength}
          />
          {field.maxLength && (
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '12px',
              fontSize: '12px',
              color: (value?.length || 0) > field.maxLength * 0.9 ? '#ff7d00' : '#86909c',
              fontWeight: (value?.length || 0) > field.maxLength * 0.9 ? 500 : 400
            }}>
              {value?.length || 0} / {field.maxLength}
            </div>
          )}
        </div>
      )}
      
      {field.type === 'select' && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={styles.input}
            style={{ flex: 1 }}
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {field.actionButton && (
            <button
              type="button"
              onClick={field.actionButton.onClick}
              className={styles.actionButton}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              {field.actionButton.text}
            </button>
          )}
        </div>
      )}
      
      {field.type === 'select-with-input' && (
        <div className={styles.selectWithInput}>
          <select
            value={value && field.options?.some(opt => opt.value === value) ? value : 'custom'}
            onChange={(e) => onChange(e.target.value === 'custom' ? '' : e.target.value)}
            className={styles.input}
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            <option value="custom">自定义</option>
          </select>
          <input
            type="text"
            value={value && !field.options?.some(opt => opt.value === value) ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            className={styles.input}
            placeholder="或输入自定义分类"
          />
        </div>
      )}
      
      {field.type === 'richtext' && (
        <div className={styles.richtextContainer}>
          <RichTextEditor
            value={value || ''}
            onChange={onChange}
            placeholder={field.placeholder}
          />
        </div>
      )}
      
      {field.type === 'image' && (
        <div className={styles.imageUploadContainer}>
          {value ? (
            <div className={styles.imagePreviewWrapper}>
              <img src={value} alt={field.label} className={styles.imagePreview} />
              <button 
                type="button" 
                onClick={() => onChange('')}
                className={styles.removeImageButton}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className={styles.imageUploadPlaceholder}>
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon size={40} />
                <span>点击上传图片</span>
                {field.hint && <span className={styles.imageHint}>{field.hint}</span>}
              </div>
              <button 
                type="button" 
                onClick={handleGenerateRandomImage}
                className={styles.generateImageButton}
              >
                随机生成主图
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}
      
      {field.type === 'tags' && (
        <div className={styles.tagsContainer}>
          <div className={styles.tagInput}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className={styles.input}
              placeholder={field.placeholder}
            />
            <button type="button" onClick={handleAddTag} className={styles.addButton}>
              添加
            </button>
          </div>
          {value && value.length > 0 && (
            <div className={styles.tags}>
              {value.map((tag: string, index: number) => (
                <span key={index} className={styles.tag}>
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      
      {field.type === 'status-button' && (
        <div className={styles.statusButtons}>
          {field.options?.map(option => (
            <button
              key={option.value}
              type="button"
              className={`${styles.statusButton} ${value === option.value ? styles.statusButtonActive : ''}`}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ItemForm({ 
  config,
  initialData, 
  onSubmit, 
  onCancel, 
  loading,
  mode,
  siteConfig
}: { 
  config: ManagementConfig
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  loading: boolean
  mode: 'new' | 'edit'
  siteConfig?: any
}) {
  const [formData, setFormData] = useState<any>(() => {
    const initial: any = {}
    config.fields.forEach(field => {
      let value = getNestedValue(initialData, field.name)
      // 如果是新建模式且字段是作者，使用站点配置的作者字段作为默认值
      if (mode === 'new' && field.name === 'author' && !value && siteConfig?.creator?.name) {
        value = siteConfig.creator.name
      }
      // 如果是新建模式且字段是content，从URL参数中获取预填数据
      if (mode === 'new' && field.name === 'content' && !value) {
        const urlParams = new URLSearchParams(window.location.search)
        const contentParam = urlParams.get('content')
        if (contentParam) {
          value = contentParam
        }
      }
      setNestedValue(initial, field.name, value ?? (field.type === 'tags' ? [] : ''))
    })
    return { ...initial, ...initialData }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    for (const field of config.fields) {
      if (field.required) {
        const value = getNestedValue(formData, field.name)
        if (!value || (Array.isArray(value) && value.length === 0)) {
          toast.error(`请输入${field.label}`)
          return
        }
      }
    }
    
    onSubmit(formData)
  }

  const updateField = (fieldName: string, value: any) => {
    const newFormData = { ...formData }
    setNestedValue(newFormData, fieldName, value)
    setFormData(newFormData)
  }

  function getNestedValue(obj: any, path: string) {
    if (!obj || !path) return undefined
    const keys = path.split('.')
    let result = obj
    for (const key of keys) {
      if (result === null || result === undefined) {
        return undefined
      }
      result = result[key]
    }
    return result
  }

  function setNestedValue(obj: any, path: string, value: any) {
    if (!obj || !path) return
    const keys = path.split('.')
    let current = obj
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (current[key] === null || current[key] === undefined || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }
    current[keys[keys.length - 1]] = value
  }

  const fieldsByGroup = config.fields.reduce((groups, field) => {
    if (field.inlineGroup) {
      if (!groups[field.inlineGroup]) {
        groups[field.inlineGroup] = [];
      }
      groups[field.inlineGroup].push(field);
    } else {
      if (!groups['default']) {
        groups['default'] = [];
      }
      groups['default'].push(field);
    }
    return groups;
  }, {} as Record<string, FieldConfig[]>);

  const threeColumnFields = config.fields.filter(f => 
    f.type !== 'richtext' && 
    f.type !== 'textarea' && 
    f.type !== 'tags' &&
    f.type !== 'image' &&
    !f.inlineGroup
  );
  const imageFields = config.fields.filter(f => 
    f.type === 'image' && !f.inlineGroup
  );
  const tagsFields = config.fields.filter(f => 
    f.type === 'tags' && !f.inlineGroup
  );
  const fullWidthFields = config.fields.filter(f => 
    (f.type === 'richtext' || f.type === 'textarea') && !f.inlineGroup
  );

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formHeader}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <h2 className={styles.formTitle}>
            {mode === 'new' ? `新建${config.title}` : `编辑${config.title}`}
          </h2>
          <button 
            type="button" 
            onClick={onCancel} 
            className={styles.backButton}
          >
            返回
          </button>
        </div>
      </div>

      <div className={styles.formBody}>
        {threeColumnFields.length > 0 && (
          <>
            {Array.from({ length: Math.ceil(threeColumnFields.length / 3) }).map((_, index) => {
              const start = index * 3;
              const rowFields = threeColumnFields.slice(start, start + 3);
              return (
                <div key={index} className={styles.formRowThree}>
                  {rowFields.map(field => (
                    <FormField
                      key={field.name}
                      field={field}
                      value={getNestedValue(formData, field.name)}
                      onChange={(value) => updateField(field.name, value)}
                    />
                  ))}
                </div>
              );
            })}
          </>
        )}

        {Object.entries(fieldsByGroup).map(([groupName, groupFields]) => {
          if (groupName !== 'default' && groupFields.length > 0) {
            return (
              <div 
                key={groupName} 
                className={groupFields.length === 2 ? styles.formRowTwo : styles.formRowThree}
              >
                {groupFields.map(field => (
                  <div key={field.name} className={styles.inlineField}>
                    <label className={styles.inlineLabel}>
                      {field.label} {field.required && '*'}
                    </label>
                    <FormField
                      field={field}
                      value={getNestedValue(formData, field.name)}
                      onChange={(value) => updateField(field.name, value)}
                    />
                  </div>
                ))}
              </div>
            );
          }
          return null;
        })}

        {imageFields.map(field => (
          <FormField
            key={field.name}
            field={field}
            value={getNestedValue(formData, field.name)}
            onChange={(value) => updateField(field.name, value)}
          />
        ))}

        {tagsFields.map(field => (
          <FormField
            key={field.name}
            field={field}
            value={getNestedValue(formData, field.name)}
            onChange={(value) => updateField(field.name, value)}
          />
        ))}

        {fullWidthFields.map(field => (
          <FormField
            key={field.name}
            field={field}
            value={getNestedValue(formData, field.name)}
            onChange={(value) => updateField(field.name, value)}
          />
        ))}
      </div>

      <div className={styles.formFooter}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          取消
        </button>
        <div className={styles.formActions}>
          {config.apiEndpoint === '/api/products' ? (
            <>
              <button 
                        type="button" 
                        onClick={() => onSubmit({ ...formData, status: 'inactive' })} 
                        disabled={loading}
                        className={styles.draftButton}
                      >
                        {loading ? '保存中...' : '保存草稿'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => onSubmit({ ...formData, status: 'inactive', saveOnly: true })} 
                        disabled={loading}
                        className={styles.draftButton}
                      >
                        {loading ? '保存中...' : '保存并返回'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => onSubmit({ ...formData, status: 'active' })} 
                        disabled={loading}
                        className={styles.publishButton}
                      >
                        {loading ? '发布中...' : (
                          <>
                            <Save size={16} />
                            上架
                          </>
                        )}
                      </button>
            </>
          ) : (
            <>
              <button 
                        type="button" 
                        onClick={() => onSubmit({ ...formData, status: 'draft' })} 
                        disabled={loading}
                        className={styles.draftButton}
                      >
                        {loading ? '保存中...' : '保存草稿'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => onSubmit({ ...formData, status: 'draft', saveOnly: true })} 
                        disabled={loading}
                        className={styles.draftButton}
                      >
                        {loading ? '保存中...' : '保存并返回'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => onSubmit({ ...formData, status: 'published' })} 
                        disabled={loading}
                        className={styles.publishButton}
                      >
                        {loading ? '发布中...' : (
                          <>
                            <Save size={16} />
                            发布
                          </>
                        )}
                      </button>
            </>
          )}
        </div>
      </div>
    </form>
  )
}

export function BaseManagement({ config }: BaseManagementProps) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentItem, setCurrentItem] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const { configs } = useConfig()
  
  // 从URL参数中获取预填数据
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const content = urlParams.get('content')
    if (content) {
      // 如果URL中有content参数，自动进入新建模式并预填数据
      setViewMode('new')
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${config.apiEndpoint}?admin=true&_t=${Date.now()}`)
      const result = await response.json()
      if (result.success && result.data) {
        setItems(result.data)
      }
    } catch (error) {
      console.error(`获取${config.title}列表失败:`, error)
      toast.error(`获取${config.title}列表失败`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data: any) => {
    try {
      setSubmitting(true)
      const { saveOnly, ...submitData } = data
      const response = await fetch(`${config.apiEndpoint}?_t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })
      const result = await response.json()
      if (result.success) {
        if (config.apiEndpoint === '/api/products') {
          if (submitData.status === 'active') {
            toast.success(`${config.title}上架成功`)
          } else if (submitData.status === 'inactive') {
            toast.success(`${config.title}保存成功`)
          }
        } else {
          if (submitData.status === 'published') {
            toast.success(`${config.title}发布成功`)
          } else if (submitData.status === 'draft') {
            toast.success(`${config.title}保存成功`)
          }
        }
        // 保存后都返回上一级页面
        setViewMode('list')
        fetchItems()
      } else {
        toast.error(result.message || '操作失败')
      }
    } catch (error) {
      console.error(`操作${config.title}失败:`, error)
      toast.error(`操作${config.title}失败`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (data: any) => {
    if (!currentItem?.id) return
    try {
      setSubmitting(true)
      const { saveOnly, ...submitData } = data
      const response = await fetch(`${config.apiEndpoint}?_t=${Date.now()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...submitData, id: currentItem.id })
      })
      const result = await response.json()
      if (result.success) {
        if (config.apiEndpoint === '/api/products') {
          if (submitData.status === 'active') {
            toast.success(`${config.title}上架成功`)
          } else if (submitData.status === 'inactive') {
            toast.success(`${config.title}保存成功`)
          }
        } else {
          if (submitData.status === 'published') {
            toast.success(`${config.title}发布成功`)
          } else if (submitData.status === 'draft') {
            toast.success(`${config.title}保存成功`)
          }
        }
        // 保存后都返回上一级页面
        setViewMode('list')
        fetchItems()
      } else {
        toast.error(result.message || '操作失败')
      }
    } catch (error) {
      console.error(`操作${config.title}失败:`, error)
      toast.error(`操作${config.title}失败`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (id: number) => {
    setItemToDelete(id)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (itemToDelete === null) return
    try {
      const response = await fetch(`${config.apiEndpoint}?id=${itemToDelete}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (result.success) {
        toast.success(`${config.title}删除成功`)
        fetchItems()
      } else {
        toast.error(result.message || '删除失败')
      }
    } catch (error) {
      console.error(`删除${config.title}失败:`, error)
      toast.error(`删除${config.title}失败`)
    } finally {
      setShowDeleteConfirm(false)
      setItemToDelete(null)
    }
  }

  const handleStatusChange = async (record: any, targetStatus: string) => {
    if (!config.statusConfig || !record.id) return
    try {
      const response = await fetch(config.apiEndpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: record.id,
          [config.statusConfig!.field]: targetStatus 
        })
      })
      const result = await response.json()
      if (result.success) {
        toast.success('状态更新成功')
        fetchItems()
      } else {
        toast.error(result.message || '状态更新失败')
      }
    } catch (error) {
      console.error('状态更新失败:', error)
      toast.error('状态更新失败')
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>加载中...</p>
      </div>
    )
  }

  if (viewMode === 'new') {
    return (
      <ItemForm
        config={config}
        onSubmit={handleCreate}
        onCancel={() => setViewMode('list')}
        loading={submitting}
        mode="new"
        siteConfig={configs.site}
      />
    )
  }

  if (viewMode === 'edit' && currentItem) {
    return (
      <ItemForm
        config={config}
        initialData={currentItem}
        onSubmit={handleUpdate}
        onCancel={() => {
          setViewMode('list')
          setCurrentItem(null)
        }}
        loading={submitting}
        mode="edit"
        siteConfig={configs.site}
      />
    )
  }

  if (viewMode === 'view' && currentItem) {
    return (
      <div className={styles.detailView}>
        <div className={styles.detailHeader}>
          <button onClick={() => {
            setViewMode('list')
            setCurrentItem(null)
          }} className={styles.backButton}>
            <ArrowLeft size={20} />
            返回列表
          </button>
          <h2 className={styles.detailTitle}>{currentItem.title || currentItem.name}</h2>
        </div>
        <div className={styles.detailBody}>
          {config.fields.map(field => {
            if (field.type === 'richtext' && currentItem[field.name]) {
              return (
                <div key={field.name} className={styles.detailSection}>
                  <h3>{field.label}</h3>
                  <div dangerouslySetInnerHTML={{ __html: currentItem[field.name] }} />
                </div>
              )
            }
            if (currentItem[field.name]) {
              return (
                <div key={field.name} className={styles.detailSection}>
                  <h3>{field.label}</h3>
                  <p>{currentItem[field.name]}</p>
                </div>
              )
            }
            return null
          })}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={styles.container}>
        <ManagementHeader
          title={`${config.title}管理`}
          description={config.description || ''}
          buttonText={`新建${config.title}`}
          buttonIcon={<Plus size={20} />}
          onButtonClick={() => setViewMode('new')}
        />

        <CommonTable
          columns={[
            ...config.columns.map(col => ({
              title: col.label,
              dataIndex: col.key,
              key: col.key,
              width: typeof col.width === 'string' ? parseInt(col.width, 10) : col.width,
              render: col.render ? (_: any, record: any) => col.render!(record) : undefined,
            })),
            {
              title: '操作',
              key: 'actions',
              width: config.actionsColumnWidth ?? (config.statusConfig ? 180 : 120),
              render: (_: any, record: any) => (
                <div className={styles.actions}>
                  {config.statusConfig && (
                    <>
                      {config.statusConfig.states.map(state => {
                        if (record[config.statusConfig!.field] === state.value) {
                          return (
                            <Tooltip key={state.value} content={state.action}>
                              <ActionButton
                                type={state.type}
                                onClick={() => handleStatusChange(record, state.target || state.value)}
                              >
                                {state.label}
                              </ActionButton>
                            </Tooltip>
                          )
                        }
                        return null
                      })}
                    </>
                  )}
                  <Tooltip content="查看">
                    <ActionButton
                      type="default"
                      icon={<Eye size={18} />}
                      onClick={() => {
                        // 打开对应的详情页面
                        if (config.apiEndpoint === '/api/products' && record.id) {
                          window.open(`/product/${record.id}`, '_blank')
                        } else if (config.apiEndpoint === '/api/articles' && record.id) {
                          window.open(`/news/${record.id}`, '_blank')
                        } else {
                          // 保持原有行为
                          setCurrentItem(record)
                          setViewMode('view')
                        }
                      }}
                    />
                  </Tooltip>
                  <Tooltip content="编辑">
                    <ActionButton
                      type="primary"
                      icon={<Edit3 size={18} />}
                      onClick={() => {
                        setCurrentItem(record)
                        setViewMode('edit')
                      }}
                    />
                  </Tooltip>
                  <Tooltip content="删除">
                    <ActionButton
                      type="danger"
                      icon={<Trash2 size={18} />}
                      onClick={() => record.id && handleDelete(record.id)}
                    />
                  </Tooltip>
                </div>
              ),
            },
          ]}
          data={items}
          loading={loading}
          emptyText={config.emptyText}
          emptyIcon={config.emptyIcon}
          scroll={{ x: 1400 }}
        />
      </div>

      <Modal
        title="确认删除"
        visible={showDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false)
          setItemToDelete(null)
        }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => {
              setShowDeleteConfirm(false)
              setItemToDelete(null)
            }}>取消</Button>
            <Button type="primary" status="danger" onClick={confirmDelete}>确认删除</Button>
          </div>
        }
      >
        <div style={{ padding: '16px 0' }}>
          <p>确定要删除这个{config.title}吗？此操作不可撤销。</p>
        </div>
      </Modal>
    </>
  )
}
