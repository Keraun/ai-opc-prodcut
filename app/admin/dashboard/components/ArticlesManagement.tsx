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
  Newspaper,
  Tag,
  FileText,
  Calendar
} from "lucide-react"
import { toast } from "sonner"
import styles from "./ProductsManagement.module.css"

interface Article {
  id?: number
  title: string
  summary: string
  content: string
  author?: string
  category?: string
  categoryName?: string
  tags?: string[]
  image?: string
  status: string
  publishTime?: string
  created_at?: string
  updated_at?: string
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
    summary: '',
    content: '',
    author: '',
    category: '',
    categoryName: '',
    tags: [],
    image: '',
    status: 'draft',
    ...initialData
  })

  const [tagInput, setTagInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('请输入文章标题')
      return
    }
    if (!formData.summary.trim()) {
      toast.error('请输入文章摘要')
      return
    }
    onSubmit(formData)
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || []
    })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>
          {mode === 'new' ? '新建资讯' : '编辑资讯'}
        </h2>
      </div>

      <div className={styles.formBody}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Newspaper size={16} />
              文章标题 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={styles.input}
              placeholder="请输入文章标题"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Tag size={16} />
              文章分类
            </label>
            <input
              type="text"
              value={formData.categoryName || ''}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              className={styles.input}
              placeholder="请输入文章分类"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            <FileText size={16} />
            文章摘要 *
          </label>
          <textarea
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className={styles.textarea}
            placeholder="请输入文章摘要"
            rows={3}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Calendar size={16} />
              作者
            </label>
            <input
              type="text"
              value={formData.author || ''}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className={styles.input}
              placeholder="请输入作者名称"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Tag size={16} />
              状态
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className={styles.input}
            >
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            <Tag size={16} />
            文章标签
          </label>
          <div className={styles.tagInput}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className={styles.input}
              placeholder="输入标签后按回车添加"
            />
            <button type="button" onClick={handleAddTag} className={styles.addButton}>
              添加
            </button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className={styles.tags}>
              {formData.tags.map((tag, index) => (
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

        <div className={styles.formGroup}>
          <label className={styles.label}>
            <FileText size={16} />
            文章内容
          </label>
          <RichTextEditor
            value={formData.content}
            onChange={(value) => setFormData({ ...formData, content: value })}
            placeholder="请输入文章内容..."
          />
        </div>
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

export function ArticlesManagement() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/articles')
      const result = await response.json()
      if (result.success && result.data) {
        setArticles(result.data)
      }
    } catch (error) {
      console.error('获取资讯列表失败:', error)
      toast.error('获取资讯列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data: Article) => {
    try {
      setSubmitting(true)
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        toast.success('资讯创建成功')
        setViewMode('list')
        fetchArticles()
      } else {
        toast.error(result.message || '创建失败')
      }
    } catch (error) {
      console.error('创建资讯失败:', error)
      toast.error('创建资讯失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (data: Article) => {
    if (!currentArticle?.id) return
    try {
      setSubmitting(true)
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: currentArticle.id })
      })
      const result = await response.json()
      if (result.success) {
        toast.success('资讯更新成功')
        setViewMode('list')
        fetchArticles()
      } else {
        toast.error(result.message || '更新失败')
      }
    } catch (error) {
      console.error('更新资讯失败:', error)
      toast.error('更新资讯失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这篇资讯吗？')) return
    try {
      const response = await fetch(`/api/articles?id=${id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (result.success) {
        toast.success('资讯删除成功')
        fetchArticles()
      } else {
        toast.error(result.message || '删除失败')
      }
    } catch (error) {
      console.error('删除资讯失败:', error)
      toast.error('删除资讯失败')
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
      <ArticleForm
        onSubmit={handleCreate}
        onCancel={() => setViewMode('list')}
        loading={submitting}
        mode="new"
      />
    )
  }

  if (viewMode === 'edit' && currentArticle) {
    return (
      <ArticleForm
        initialData={currentArticle}
        onSubmit={handleUpdate}
        onCancel={() => {
          setViewMode('list')
          setCurrentArticle(null)
        }}
        loading={submitting}
        mode="edit"
      />
    )
  }

  if (viewMode === 'view' && currentArticle) {
    return (
      <div className={styles.detailView}>
        <div className={styles.detailHeader}>
          <button onClick={() => {
            setViewMode('list')
            setCurrentArticle(null)
          }} className={styles.backButton}>
            <ArrowLeft size={20} />
            返回列表
          </button>
          <h2 className={styles.detailTitle}>{currentArticle.title}</h2>
        </div>
        <div className={styles.detailBody}>
          <div className={styles.detailSection}>
            <h3>文章摘要</h3>
            <p>{currentArticle.summary}</p>
          </div>
          {currentArticle.content && (
            <div className={styles.detailSection}>
              <h3>文章内容</h3>
              <div dangerouslySetInnerHTML={{ __html: currentArticle.content }} />
            </div>
          )}
          <div className={styles.detailMeta}>
            {currentArticle.author && (
              <div className={styles.metaItem}>
                <span>作者: {currentArticle.author}</span>
              </div>
            )}
            {currentArticle.categoryName && (
              <div className={styles.metaItem}>
                <Tag size={16} />
                <span>{currentArticle.categoryName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>资讯管理</h1>
        <button onClick={() => setViewMode('new')} className={styles.primaryButton}>
          <Plus size={20} />
          新建资讯
        </button>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div className={styles.tableRow}>
            <div className={styles.tableCell}>文章标题</div>
            <div className={styles.tableCell}>分类</div>
            <div className={styles.tableCell}>作者</div>
            <div className={styles.tableCell}>状态</div>
            <div className={styles.tableCell}>操作</div>
          </div>
        </div>
        <div className={styles.tableBody}>
          {articles.length === 0 ? (
            <div className={styles.empty}>
              <Newspaper size={48} />
              <p>暂无资讯数据</p>
            </div>
          ) : (
            articles.map((article) => (
              <div key={article.id} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <div className={styles.productName}>{article.title}</div>
                  <div className={styles.productDesc}>{article.summary}</div>
                </div>
                <div className={styles.tableCell}>{article.categoryName || '-'}</div>
                <div className={styles.tableCell}>{article.author || '-'}</div>
                <div className={styles.tableCell}>
                  <span className={`${styles.status} ${article.status === 'published' ? styles.statusActive : styles.statusInactive}`}>
                    {article.status === 'published' ? '已发布' : '草稿'}
                  </span>
                </div>
                <div className={styles.tableCell}>
                  <div className={styles.actions}>
                    <button
                      onClick={() => {
                        setCurrentArticle(article)
                        setViewMode('view')
                      }}
                      className={styles.iconButton}
                      title="查看"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentArticle(article)
                        setViewMode('edit')
                      }}
                      className={styles.iconButton}
                      title="编辑"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => article.id && handleDelete(article.id)}
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
