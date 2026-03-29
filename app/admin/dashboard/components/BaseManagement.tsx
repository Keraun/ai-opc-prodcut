"use client"

import { useState, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
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
  FileText
} from "lucide-react"
import { toast } from "sonner"
import styles from "./BaseManagement.module.css"

export interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'richtext' | 'tags'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  rows?: number
  icon?: React.ReactNode
}

export interface ColumnConfig {
  key: string
  label: string
  render?: (item: any) => React.ReactNode
  width?: string
}

export interface ManagementConfig {
  title: string
  apiEndpoint: string
  fields: FieldConfig[]
  columns: ColumnConfig[]
  emptyIcon: React.ReactNode
  emptyText: string
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
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

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
      </div>
      <EditorContent editor={editor} className={styles.editorContent} />
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

  const handleAddTag = () => {
    if (tagInput.trim() && !value?.includes(tagInput.trim())) {
      onChange([...(value || []), tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    onChange(value?.filter((t: string) => t !== tag) || [])
  }

  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>
        {field.icon}
        {field.label} {field.required && '*'}
      </label>
      
      {field.type === 'text' && (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={styles.input}
          placeholder={field.placeholder}
        />
      )}
      
      {field.type === 'textarea' && (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={styles.textarea}
          placeholder={field.placeholder}
          rows={field.rows || 3}
        />
      )}
      
      {field.type === 'select' && (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={styles.input}
        >
          {field.options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      
      {field.type === 'richtext' && (
        <RichTextEditor
          value={value || ''}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      )}
      
      {field.type === 'tags' && (
        <>
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
        </>
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
  mode
}: { 
  config: ManagementConfig
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  loading: boolean
  mode: 'new' | 'edit'
}) {
  const [formData, setFormData] = useState<any>(() => {
    const initial: any = {}
    config.fields.forEach(field => {
      initial[field.name] = initialData?.[field.name] ?? (field.type === 'tags' ? [] : '')
    })
    return { ...initial, ...initialData }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    for (const field of config.fields) {
      if (field.required) {
        const value = formData[field.name]
        if (!value || (Array.isArray(value) && value.length === 0)) {
          toast.error(`请输入${field.label}`)
          return
        }
      }
    }
    
    onSubmit(formData)
  }

  const updateField = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value })
  }

  const halfWidthFields = config.fields.filter(f => 
    f.type === 'text' && !f.name.includes('description') && !f.name.includes('summary')
  )
  const fullWidthFields = config.fields.filter(f => 
    f.type !== 'text' || f.name.includes('description') || f.name.includes('summary')
  )

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>
          {mode === 'new' ? `新建${config.title}` : `编辑${config.title}`}
        </h2>
      </div>

      <div className={styles.formBody}>
        {halfWidthFields.length > 0 && (
          <div className={styles.formRow}>
            {halfWidthFields.map(field => (
              <FormField
                key={field.name}
                field={field}
                value={formData[field.name]}
                onChange={(value) => updateField(field.name, value)}
              />
            ))}
          </div>
        )}

        {fullWidthFields.map(field => (
          <FormField
            key={field.name}
            field={field}
            value={formData[field.name]}
            onChange={(value) => updateField(field.name, value)}
          />
        ))}
      </div>

      <div className={styles.formFooter}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          取消
        </button>
        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? '保存中...' : (
            <>
              <Save size={16} />
              保存
            </>
          )}
        </button>
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

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await fetch(config.apiEndpoint)
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
      const response = await fetch(config.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        toast.success(`${config.title}创建成功`)
        setViewMode('list')
        fetchItems()
      } else {
        toast.error(result.message || '创建失败')
      }
    } catch (error) {
      console.error(`创建${config.title}失败:`, error)
      toast.error(`创建${config.title}失败`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (data: any) => {
    if (!currentItem?.id) return
    try {
      setSubmitting(true)
      const response = await fetch(config.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: currentItem.id })
      })
      const result = await response.json()
      if (result.success) {
        toast.success(`${config.title}更新成功`)
        setViewMode('list')
        fetchItems()
      } else {
        toast.error(result.message || '更新失败')
      }
    } catch (error) {
      console.error(`更新${config.title}失败:`, error)
      toast.error(`更新${config.title}失败`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm(`确定要删除这个${config.title}吗？`)) return
    try {
      const response = await fetch(`${config.apiEndpoint}?id=${id}`, {
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{config.title}管理</h1>
        <button onClick={() => setViewMode('new')} className={styles.primaryButton}>
          <Plus size={20} />
          新建{config.title}
        </button>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div className={styles.tableRow}>
            {config.columns.map(column => (
              <div 
                key={column.key} 
                className={styles.tableCell}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.label}
              </div>
            ))}
            <div className={styles.tableCell}>操作</div>
          </div>
        </div>
        <div className={styles.tableBody}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              {config.emptyIcon}
              <p>{config.emptyText}</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className={styles.tableRow}>
                {config.columns.map(column => (
                  <div 
                    key={column.key} 
                    className={styles.tableCell}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.render ? column.render(item) : item[column.key]}
                  </div>
                ))}
                <div className={styles.tableCell}>
                  <div className={styles.actions}>
                    <button
                      onClick={() => {
                        setCurrentItem(item)
                        setViewMode('view')
                      }}
                      className={styles.iconButton}
                      title="查看"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentItem(item)
                        setViewMode('edit')
                      }}
                      className={styles.iconButton}
                      title="编辑"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => item.id && handleDelete(item.id)}
                      className={`${styles.iconButton} ${styles.deleteButton}`}
                      title="删除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
