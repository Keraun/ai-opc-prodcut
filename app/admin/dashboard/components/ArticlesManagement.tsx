"use client"

import { useState, useEffect } from "react"
import { Button, Card, Table, Spin } from "@arco-design/web-react"
import { IconPlus, IconDelete, IconEdit, IconEye, IconLeft } from "@arco-design/web-react/icon"
import { toast } from "sonner"
import { DynamicForm } from "@/components/dynamic-form"
import styles from "./ArticlesManagement.module.css"

interface Article {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  contentFormat: 'html' | 'markdown'
  date: string
  author?: string
  tags?: string[]
  image?: string
  status: 'published' | 'draft'
}

interface FormSchema {
  title: string
  description?: string
  type: string
  properties: Record<string, any>
  required?: string[]
  ui?: any
}

type ViewMode = 'list' | 'new' | 'edit' | 'view'

export function ArticlesManagement() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null)
  const [schema, setSchema] = useState<FormSchema | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchArticles()
    fetchSchema()
  }, [])

  const fetchSchema = async () => {
    try {
      const response = await fetch('/api/admin/schema?type=article')
      if (response.ok) {
        const data = await response.json()
        setSchema(data)
      }
    } catch (error) {
      console.error('Failed to fetch schema:', error)
    }
  }

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/articles')
      if (response.ok) {
        const data = await response.json()
        setArticles(data)
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
        
        if (response.ok) {
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

  const handleSubmit = async (values: Record<string, any>) => {
    setSubmitting(true)
    try {
      let response
      if (currentArticle) {
        response = await fetch('/api/articles', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...values,
            id: currentArticle.id
          })
        })
      } else {
        response = await fetch('/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        })
      }
      
      if (response.ok) {
        const savedArticle = await response.json()
        if (currentArticle) {
          setArticles(articles.map(article => 
            article.id === currentArticle.id ? savedArticle : article
          ))
          toast.success('文章更新成功')
        } else {
          setArticles([...articles, savedArticle])
          toast.success('文章创建成功')
        }
        setViewMode('list')
        fetchArticles()
      } else {
        toast.error('保存文章失败')
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

  const columns = [
    {
      title: '标题',
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
            icon={<IconEye />}
            onClick={() => handleViewArticle(record)}
          >
            查看
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<IconEdit />}
            onClick={() => handleEditArticle(record)}
          >
            编辑
          </Button>
          <Button
            status="danger"
            size="small"
            icon={<IconDelete />}
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
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <Button
            type="text"
            icon={<IconLeft />}
            onClick={handleBack}
          >
            返回文章列表
          </Button>
          <h2 className={styles.formTitle}>
            {viewMode === 'new' ? '新建文章' : '编辑文章'}
          </h2>
        </div>
        <Card className={styles.formCard}>
          {schema && (
            <DynamicForm
              schema={schema}
              initialValues={currentArticle || {}}
              onSubmit={handleSubmit}
              onCancel={handleBack}
              loading={submitting}
            />
          )}
        </Card>
      </div>
    )
  }

  if (viewMode === 'view' && currentArticle) {
    return (
      <div className={styles.viewContainer}>
        <div className={styles.viewHeader}>
          <Button
            type="text"
            icon={<IconLeft />}
            onClick={handleBack}
          >
            返回文章列表
          </Button>
          <h2 className={styles.viewTitle}>{currentArticle.title}</h2>
          <Button
            type="primary"
            icon={<IconEdit />}
            onClick={() => handleEditArticle(currentArticle)}
          >
            编辑文章
          </Button>
        </div>
        <Card className={styles.viewCard}>
          <div className={styles.viewContent}>
            <div className={styles.viewField}>
              <label className={styles.viewLabel}>标题</label>
              <p className={styles.viewValue}>{currentArticle.title}</p>
            </div>
            <div className={styles.viewField}>
              <label className={styles.viewLabel}>URL别名</label>
              <p className={styles.viewValue}>{currentArticle.slug}</p>
            </div>
            <div className={styles.viewField}>
              <label className={styles.viewLabel}>摘要</label>
              <p className={styles.viewValue}>{currentArticle.summary}</p>
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
              <div className={styles.viewField}>
                <label className={styles.viewLabel}>状态</label>
                <span className={`${styles.statusBadge} ${currentArticle.status === 'published' ? styles.statusPublished : styles.statusDraft}`}>
                  {currentArticle.status === 'published' ? '已发布' : '草稿'}
                </span>
              </div>
            </div>
            <div className={styles.viewField}>
              <label className={styles.viewLabel}>标签</label>
              <div className={styles.tagsList}>
                {currentArticle.tags && currentArticle.tags.length > 0 ? (
                  currentArticle.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>{tag}</span>
                  ))
                ) : (
                  <span className={styles.noTags}>无标签</span>
                )}
              </div>
            </div>
            <div className={styles.viewField}>
              <label className={styles.viewLabel}>内容格式</label>
              <p className={styles.viewValue}>
                {currentArticle.contentFormat === 'markdown' ? 'Markdown' : 'HTML'}
              </p>
            </div>
            <div className={styles.viewField}>
              <label className={styles.viewLabel}>文章内容</label>
              <pre className={styles.contentPreview}>{currentArticle.content}</pre>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.listContainer}>
      <div className={styles.listHeader}>
        <div>
          <h2 className={styles.listTitle}>文章管理</h2>
          <p className={styles.listDescription}>管理网站文章内容，支持Markdown和HTML格式</p>
        </div>
        <Button
          type="primary"
          icon={<IconPlus />}
          onClick={handleAddArticle}
        >
          新建文章
        </Button>
      </div>

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
  )
}
