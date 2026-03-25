"use client"

import { useState, useEffect } from "react"
import { Button, Card, Table, Modal, Message } from "@arco-design/web-react"
import { IconPlus, IconDelete, IconEdit, IconEye } from "@arco-design/web-react/icon"
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

export function ArticlesManagement() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null)
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null)
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
    setModalVisible(true)
  }

  const handleEditArticle = (article: Article) => {
    setCurrentArticle(article)
    setModalVisible(true)
  }

  const handleViewArticle = (article: Article) => {
    setViewingArticle(article)
    setViewModalVisible(true)
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
        setModalVisible(false)
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.headerTitle}>文章管理</h1>
            <p className={styles.headerDescription}>管理网站文章内容，支持Markdown和HTML格式</p>
          </div>
          <Button
            type="primary"
            icon={<IconPlus />}
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

      {/* 编辑/新建文章Modal */}
      <Modal
        title={currentArticle ? '编辑文章' : '新建文章'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        style={{ width: 900 }}
      >
        {schema && (
          <DynamicForm
            schema={schema}
            initialValues={currentArticle || {}}
            onSubmit={handleSubmit}
            onCancel={() => setModalVisible(false)}
            loading={submitting}
          />
        )}
      </Modal>

      {/* 查看文章Modal */}
      <Modal
        title="文章详情"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>
        ]}
        style={{ width: 800 }}
      >
        {viewingArticle && (
          <div className={styles.viewContent}>
            <div className={styles.viewField}>
              <label className={styles.viewLabel}>标题：</label>
              <span>{viewingArticle.title}</span>
            </div>
            <div className={styles.viewField}>
              <label className={styles.viewLabel}>URL别名：</label>
              <span>{viewingArticle.slug}</span>
            </div>
            <div className={styles.viewField}>
              <label className={styles.viewLabel}>摘要：</label>
              <p>{viewingArticle.summary}</p>
            </div>
            <div className={styles.viewField}>
              <label className={styles.viewLabel}>作者：</label>
              <span>{viewingArticle.author || '未设置'}</span>
            </div>
            <div className={styles.viewField}>
              <label className={styles.viewLabel}>发布日期：</label>
              <span>{viewingArticle.date}</span>
            </div>
            <div className={styles.viewField}>
              <label className={styles.viewLabel}>状态：</label>
              <span className={`${styles.statusBadge} ${viewingArticle.status === 'published' ? styles.statusPublished : styles.statusDraft}`}>
                {viewingArticle.status === 'published' ? '已发布' : '草稿'}
              </span>
            </div>
            <div className={styles.viewField}>
              <label className={styles.viewLabel}>标签：</label>
              <div className={styles.tagsList}>
                {viewingArticle.tags?.map((tag, index) => (
                  <span key={index} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
            <div className={styles.viewField}>
              <label className={styles.viewLabel}>内容格式：</label>
              <span>{viewingArticle.contentFormat === 'markdown' ? 'Markdown' : 'HTML'}</span>
            </div>
            <div className={styles.viewField}>
              <label className={styles.viewLabel}>文章内容：</label>
              <pre className={styles.contentPreview}>{viewingArticle.content}</pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
