"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Table, Message } from "@arco-design/web-react"
import { IconPlus } from "@arco-design/web-react/icon"
import { toast } from "sonner"
import { getArticles, deleteArticle } from "@/lib/api-client"
import styles from "./articles.module.css"

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

export default function ArticlesListPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const data = await getArticles()
      setArticles(data)
    } catch (error) {
      console.error('Failed to fetch articles:', error)
      toast.error('获取文章列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAddArticle = () => {
    router.push('/admin/articles/new')
  }

  const handleEditArticle = (article: Article) => {
    router.push(`/admin/articles/edit/${article.id}`)
  }

  const handleViewArticle = (article: Article) => {
    router.push(`/admin/articles/view/${article.id}`)
  }

  const handleDeleteArticle = async (article: Article) => {
    if (confirm(`确定要删除文章 "${article.title}" 吗？`)) {
      try {
        const result = await deleteArticle(article.id)
        
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
      width: 160,
      render: (_: any, record: Article) => (
        <div className={styles.actionButtons}>
          <Button
            type="text"
            size="small"
            onClick={() => handleViewArticle(record)}
          >
            查看
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => handleEditArticle(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            size="small"
            status="danger"
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
    </div>
  )
}
