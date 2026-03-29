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
import { Tooltip } from '@arco-design/web-react'
import { ManagementHeader } from './ManagementHeader'
import { CommonTable, ActionButton } from './CommonTable'
import styles from "./BaseManagement.module.css"

export interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'richtext' | 'tags' | 'status-button'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  rows?: number
  icon?: React.ReactNode
  inlineGroup?: string
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
  description?: string
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
    immediatelyRender: false,
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
    <div className={`${styles.formGroup} ${field.type === 'richtext' ? styles.formGroupRichtext : ''} ${field.inlineGroup ? styles.formGroupInline : ''}`}>
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
        <div className={styles.richtextContainer}>
          <RichTextEditor
            value={value || ''}
            onChange={onChange}
            placeholder={field.placeholder}
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
    !f.inlineGroup
  );
  const fullWidthFields = config.fields.filter(f => 
    f.type === 'richtext' || f.type === 'textarea'
  );

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>
          {mode === 'new' ? `新建${config.title}` : `编辑${config.title}`}
        </h2>
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
                      value={formData[field.name]}
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
              <div key={groupName} className={styles.formRow}>
                <label className={styles.label}>{groupName}</label>
                <div className={styles.inlineGroup}>
                  {groupFields.map(field => (
                    <div key={field.name} className={styles.inlineField}>
                      <label className={styles.inlineLabel}>{field.label}</label>
                      <FormField
                        field={field}
                        value={formData[field.name]}
                        onChange={(value) => updateField(field.name, value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })}

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
            width: col.width,
            render: col.render ? (_: any, record: any) => col.render!(record) : undefined,
          })),
          {
            title: '操作',
            key: 'actions',
            width: 120,
            render: (_: any, record: any) => (
              <div className={styles.actions}>
                <Tooltip content="查看">
                  <ActionButton
                    type="default"
                    icon={<Eye size={18} />}
                    onClick={() => {
                      setCurrentItem(record)
                      setViewMode('view')
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
        scroll={{ x: 1000 }}
      />
    </div>
  )
}
