"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Input, Select, Message } from "@arco-design/web-react"
import { 
  IconBold, 
  IconItalic, 
  IconUnderline, 
  IconOrderedList, 
  IconUnorderedList,
  IconLink,
  IconImage
} from "@arco-design/web-react/icon"
import { ChevronLeft as IconChevronLeft } from "lucide-react"
import { toast } from "sonner"
import styles from "../articles.module.css"

const TextArea = Input.TextArea
const Option = Select.Option

interface Article {
  id?: string
  title: string
  slug: string
  summary: string
  content: string
  date: string
  author?: string
  category?: string
  tags?: string[]
  image?: string
  status: string
}

function RichTextEditor({ 
  value, 
  onChange,
  placeholder = "请输入内容..."
}: { 
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [])

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleLink = () => {
    const url = prompt('请输入链接地址:', 'https://')
    if (url) {
      execCommand('createLink', url)
    }
  }

  const handleImage = () => {
    const url = prompt('请输入图片地址:', 'https://')
    if (url) {
      execCommand('insertImage', url)
    }
  }

  const toolbarItems = [
    { icon: <IconBold />, command: 'bold', title: '粗体' },
    { icon: <IconItalic />, command: 'italic', title: '斜体' },
    { icon: <IconUnderline />, command: 'underline', title: '下划线' },
    { icon: <IconOrderedList />, command: 'insertOrderedList', title: '有序列表' },
    { icon: <IconUnorderedList />, command: 'insertUnorderedList', title: '无序列表' },
  ]

  return (
    <div className={`${styles.richEditor} ${isFocused ? styles.richEditorFocused : ''}`}>
      <div className={styles.richToolbar}>
        {toolbarItems.map((item, index) => (
          <button
            key={index}
            type="button"
            className={styles.toolbarBtn}
            onClick={() => execCommand(item.command)}
            title={item.title}
          >
            {item.icon}
          </button>
        ))}
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={handleLink}
          title="插入链接"
        >
          <IconLink />
        </button>
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={handleImage}
          title="插入图片"
        >
          <IconImage />
        </button>
      </div>
      <div
        ref={editorRef}
        className={styles.richContent}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  )
}

function ArticleForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  loading,
  mode
}: { 
  initialData?: Article
  onSubmit: (data: Article) => void
  onCancel: () => void
  loading: boolean
  mode: 'new' | 'edit'
}) {
  const [formData, setFormData] = useState<Article>({
    title: '',
    slug: '',
    summary: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    author: '',
    category: '',
    tags: [],
    image: '',
    status: 'published',
    ...initialData
  })
  const [tagInput, setTagInput] = useState('')

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error('请输入文章标题')
      return
    }
    if (!formData.summary.trim()) {
      toast.error('请输入文章摘要')
      return
    }
    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    onSubmit({ ...formData, slug })
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag)
    })
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>基本信息</h3>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              文章标题 <span className={styles.required}>*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(value) => setFormData({ ...formData, title: value })}
              placeholder="请输入文章标题"
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>URL别名</label>
            <Input
              value={formData.slug}
              onChange={(value) => setFormData({ ...formData, slug: value })}
              placeholder="留空将自动生成"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>文章分类</label>
            <Select
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value })}
              placeholder="请选择分类"
              allowClear
            >
              <Option value="industry">行业资讯</Option>
              <Option value="technology">技术动态</Option>
              <Option value="product">产品更新</Option>
              <Option value="tutorial">教程指南</Option>
            </Select>
          </div>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>作者</label>
            <Input
              value={formData.author}
              onChange={(value) => setFormData({ ...formData, author: value })}
              placeholder="请输入作者名称"
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>发布日期</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(value) => setFormData({ ...formData, date: value })}
            />
          </div>
        </div>

        <div className={styles.formField}>
          <label className={styles.fieldLabel}>
            文章摘要 <span className={styles.required}>*</span>
          </label>
          <TextArea
            value={formData.summary}
            onChange={(value) => setFormData({ ...formData, summary: value })}
            placeholder="请输入文章摘要"
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.fieldLabel}>文章内容</label>
          <RichTextEditor
            value={formData.content || ''}
            onChange={(value) => setFormData({ ...formData, content: value })}
            placeholder="请输入文章内容..."
          />
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>媒体与设置</h3>
        <div className={styles.formField}>
          <label className={styles.fieldLabel}>封面图片</label>
          <Input
            value={formData.image}
            onChange={(value) => setFormData({ ...formData, image: value })}
            placeholder="请输入封面图片URL"
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>发布状态</label>
            <Select
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value })}
              style={{ width: '100%' }}
            >
              <Option value="published">已发布</Option>
              <Option value="draft">草稿</Option>
            </Select>
          </div>
        </div>

        <div className={styles.formField}>
          <label className={styles.fieldLabel}>文章标签</label>
          <div className={styles.tagInput}>
            <Input
              value={tagInput}
              onChange={setTagInput}
              placeholder="输入标签后按回车添加"
              onPressEnter={addTag}
              style={{ flex: 1 }}
            />
            <Button type="primary" onClick={addTag}>添加</Button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className={styles.tagsList}>
              {formData.tags.map((tag, index) => (
                <span key={index} className={styles.tagItem}>
                  {tag}
                  <button 
                    type="button" 
                    className={styles.tagRemove}
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.formActions}>
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" loading={loading} onClick={handleSubmit}>
          {mode === 'new' ? '发布文章' : '保存修改'}
        </Button>
      </div>
    </div>
  )
}

export default function NewArticlePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (data: Article) => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      
      if (result.success) {
        toast.success('文章创建成功')
        router.push('/admin/articles')
      } else {
        toast.error(result.message || '保存文章失败')
      }
    } catch (error) {
      console.error('Failed to save article:', error)
      toast.error('保存文章失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/articles')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="text"
              icon={<IconChevronLeft />}
              onClick={handleCancel}
              style={{ color: 'white' }}
            >
              返回文章列表
            </Button>
            <h1 className={styles.headerTitle}>新建文章</h1>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <Card className={styles.formCard}>
          <ArticleForm
            mode="new"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={submitting}
          />
        </Card>
      </div>
    </div>
  )
}
