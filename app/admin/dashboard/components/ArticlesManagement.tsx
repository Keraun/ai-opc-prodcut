"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button, Card, Input, Select, Table } from "@arco-design/web-react"
import { 
  IconBold, 
  IconItalic, 
  IconUnderline, 
  IconOrderedList, 
  IconUnorderedList,
  IconLink,
  IconImage
} from "@arco-design/web-react/icon"
import { ChevronLeft as IconChevronLeft, Edit as IconEdit, Eye as IconEye, Trash2 as IconTrash2, Plus as IconPlus } from "lucide-react"
import { toast } from "sonner"
import styles from "./ArticlesManagement.module.css"

const TextArea = Input.TextArea
const Option = Select.Option

interface Article {
  id?: number
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
  created_at: string
  updated_at: string
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    onSubmit(formData)
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
              placeholder="例如：my-first-article"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>作者</label>
            <Input
              value={formData.author}
              onChange={(value) => setFormData({ ...formData, author: value })}
              placeholder="请输入作者"
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>发布日期</label>
            <Input
              value={formData.date}
              onChange={(value) => setFormData({ ...formData, date: value })}
              placeholder="YYYY-MM-DD"
            />
          </div>
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
            <label className={styles.fieldLabel}>状态</label>
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
        <h3 className={styles.sectionTitle}>媒体</h3>
        <div className={styles.formField}>
          <label className={styles.fieldLabel}>封面图片</label>
          <Input
            value={formData.image}
            onChange={(value) => setFormData({ ...formData, image: value })}
            placeholder="请输入封面图片URL"
          />
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>标签</h3>
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
          {mode === 'new' ? '创建文章' : '保存修改'}
        </Button>
      </div>
    </div>
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
      const response = await fetch('/api/articles?admin=true')
      const result = await response.json()
      if (result.success && result.data) {
        setArticles(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error)
      toast.error('获取文章列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAddArticle = () => {
    setCurrentArticle(null)
    setViewMode('new')
  }

  const handleEditArticle = (article: Article) => {
    setCurrentArticle(article)
    setViewMode('edit')
  }

  const handleViewArticle = (article: Article) => {
    setCurrentArticle(article)
    setViewMode('view')
  }

  const handleDeleteArticle = async (article: Article) => {
    if (confirm(`确定要删除文章 "${article.title}" 吗？`)) {
      try {
        const response = await fetch(`/api/articles?id=${article.id}`, {
          method: 'DELETE'
        })
        const result = await response.json()
        
        if (result.success) {
          setArticles(articles.filter(a => a.id !== article.id))
          toast.success('文章删除成功')
        } else {
          toast.error('删除文章失败')
        }
      } catch (error) {
        console.error('Failed to delete article:', error)
        toast.error('删除文章失败')
      }
    }
  }

  const handleSubmit = async (data: Article) => {
    setSubmitting(true)
    try {
      let response
      if (currentArticle) {
        response = await fetch('/api/articles', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...data, id: currentArticle.id })
        })
      } else {
        response = await fetch('/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
      }
      const result = await response.json()
      
      if (result.success) {
        if (currentArticle) {
          setArticles(articles.map(article => 
            article.id === currentArticle.id ? result.data : article
          ))
          toast.success('文章更新成功')
        } else {
          if (result.data) {
            setArticles([...articles, result.data])
          }
          toast.success('文章创建成功')
        }
        setViewMode('list')
        fetchArticles()
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

  const handleBack = () => {
    setViewMode('list')
    setCurrentArticle(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'industry': '行业资讯',
      'technology': '技术动态',
      'product': '产品更新',
      'tutorial': '教程指南'
    }
    return categoryMap[category] || category
  }

  const columns = [
    {
      title: '文章标题',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (text: string) => (
        <div className={styles.titleCell}>{text}</div>
      )
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
      render: (text: string) => (
        <div className={styles.summaryCell}>{text}</div>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => category ? getCategoryName(category) : '未分类'
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 100
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <span className={`${styles.statusBadge} ${status === 'published' ? styles.statusPublished : styles.statusDraft}`}>
          {status === 'published' ? '已发布' : '草稿'}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Article) => (
        <div className={styles.actionButtons}>
          <Button
            type="text"
            size="small"
            icon={<IconEye size={16} />}
            onClick={() => handleViewArticle(record)}
          >
            查看
          </Button>
          <Button
            type="text"
            size="small"
            icon={<IconEdit size={16} />}
            onClick={() => handleEditArticle(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            size="small"
            status="danger"
            icon={<IconTrash2 size={16} />}
            onClick={() => handleDeleteArticle(record)}
          >
            删除
          </Button>
        </div>
      )
    }
  ]

  if (viewMode === 'new' || viewMode === 'edit') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Button
                type="text"
                icon={<IconChevronLeft />}
                onClick={handleBack}
                style={{ color: 'white' }}
              >
                返回文章列表
              </Button>
              <h1 className={styles.headerTitle}>
                {viewMode === 'new' ? '新建文章' : '编辑文章'}
              </h1>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <Card className={styles.formCard}>
            <ArticleForm
              mode={viewMode as 'new' | 'edit'}
              initialData={currentArticle || undefined}
              onSubmit={handleSubmit}
              onCancel={handleBack}
              loading={submitting}
            />
          </Card>
        </div>
      </div>
    )
  }

  if (viewMode === 'view' && currentArticle) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Button
                type="text"
                icon={<IconChevronLeft />}
                onClick={handleBack}
                style={{ color: 'white' }}
              >
                返回文章列表
              </Button>
              <h1 className={styles.headerTitle}>{currentArticle.title}</h1>
            </div>
            <Button
              type="primary"
              icon={<IconEdit size={16} />}
              onClick={() => handleEditArticle(currentArticle)}
            >
              编辑文章
            </Button>
          </div>
        </div>

        <div className={styles.content}>
          <Card className={styles.viewCard}>
            <div className={styles.viewContent}>
              <div className={styles.viewSection}>
                <h3 className={styles.sectionTitle}>基本信息</h3>
                <div className={styles.viewField}>
                  <label className={styles.viewLabel}>文章标题</label>
                  <p className={styles.viewValue}>{currentArticle.title}</p>
                </div>
                <div className={styles.viewRow}>
                  <div className={styles.viewField}>
                    <label className={styles.viewLabel}>URL别名</label>
                    <p className={styles.viewValue}>{currentArticle.slug}</p>
                  </div>
                  <div className={styles.viewField}>
                    <label className={styles.viewLabel}>文章分类</label>
                    <p className={styles.viewValue}>{currentArticle.category ? getCategoryName(currentArticle.category) : '未分类'}</p>
                  </div>
                  <div className={styles.viewField}>
                    <label className={styles.viewLabel}>状态</label>
                    <span className={`${styles.statusBadge} ${currentArticle.status === 'published' ? styles.statusPublished : styles.statusDraft}`}>
                      {currentArticle.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </div>
                </div>
                <div className={styles.viewRow}>
                  <div className={styles.viewField}>
                    <label className={styles.viewLabel}>作者</label>
                    <p className={styles.viewValue}>{currentArticle.author || '未设置'}</p>
                  </div>
                  <div className={styles.viewField}>
                    <label className={styles.viewLabel}>发布日期</label>
                    <p className={styles.viewValue}>{currentArticle.date}</p>
                  </div>
                </div>
                <div className={styles.viewField}>
                  <label className={styles.viewLabel}>文章摘要</label>
                  <p className={styles.viewValue}>{currentArticle.summary}</p>
                </div>
              </div>

              <div className={styles.viewSection}>
                <h3 className={styles.sectionTitle}>媒体</h3>
                <div className={styles.viewField}>
                  <label className={styles.viewLabel}>封面图片</label>
                  {currentArticle.image ? (
                    <div className={styles.imagePreview}>
                      <img src={currentArticle.image} alt={currentArticle.title} />
                    </div>
                  ) : (
                    <p className={styles.viewValue}>暂无封面图片</p>
                  )}
                </div>
              </div>

              <div className={styles.viewSection}>
                <h3 className={styles.sectionTitle}>标签</h3>
                <div className={styles.viewField}>
                  <label className={styles.viewLabel}>文章标签</label>
                  <div className={styles.tagsList}>
                    {currentArticle.tags && currentArticle.tags.length > 0 ? (
                      currentArticle.tags.map((tag, index) => (
                        <span key={index} className={styles.tagItem}>{tag}</span>
                      ))
                    ) : (
                      <span className={styles.noTags}>无标签</span>
                    )}
                  </div>
                </div>
              </div>

              {currentArticle.content && (
                <div className={styles.viewSection}>
                  <h3 className={styles.sectionTitle}>文章内容</h3>
                  <div 
                    className={styles.htmlContent}
                    dangerouslySetInnerHTML={{ __html: currentArticle.content }}
                  />
                </div>
              )}

              <div className={styles.viewSection}>
                <h3 className={styles.sectionTitle}>时间信息</h3>
                <div className={styles.viewRow}>
                  <div className={styles.viewField}>
                    <label className={styles.viewLabel}>创建时间</label>
                    <p className={styles.viewValue}>{formatDate(currentArticle.created_at)}</p>
                  </div>
                  <div className={styles.viewField}>
                    <label className={styles.viewLabel}>更新时间</label>
                    <p className={styles.viewValue}>{formatDate(currentArticle.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.headerTitle}>文章管理</h1>
            <p className={styles.headerDescription}>管理网站文章内容</p>
          </div>
          <Button
            type="primary"
            icon={<IconPlus size={16} />}
            onClick={handleAddArticle}
          >
            新建文章
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        <Card className={styles.tableCard}>
          <Table
            columns={columns}
            data={articles}
            loading={loading}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showTotal: true,
              showJumper: true
            }}
          />
        </Card>
      </div>
    </div>
  )
}
