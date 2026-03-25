"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button, Card, Spin } from "@arco-design/web-react"
import { IconLeft, IconEdit } from "@arco-design/web-react/icon"
import { toast } from "sonner"
import styles from "../../articles.module.css"

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

export default function ViewArticlePage() {
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string
  
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticle()
  }, [articleId])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/articles?id=${articleId}`)
      if (response.ok) {
        const data = await response.json()
        setArticle(data)
      } else {
        toast.error('文章不存在')
        router.push('/admin/articles')
      }
    } catch (error) {
      console.error('Failed to fetch article:', error)
      toast.error('加载文章失败')
      router.push('/admin/articles')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(`/admin/articles/edit/${articleId}`)
  }

  const handleBack = () => {
    router.push('/admin/articles')
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size={40} />
      </div>
    )
  }

  if (!article) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="text"
              icon={<IconLeft />}
              onClick={handleBack}
            >
              返回文章列表
            </Button>
            <h1 className={styles.headerTitle}>{article.title}</h1>
          </div>
          <Button
            type="primary"
            icon={<IconEdit />}
            onClick={handleEdit}
          >
            编辑文章
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        <Card className={styles.viewCard}>
          <div className={styles.viewContent}>
            <div className={styles.viewField}>
              <label className={styles.viewLabel}>标题</label>
              <p className={styles.viewValue}>{article.title}</p>
            </div>

            <div className={styles.viewField}>
              <label className={styles.viewLabel}>URL别名</label>
              <p className={styles.viewValue}>{article.slug}</p>
            </div>

            <div className={styles.viewField}>
              <label className={styles.viewLabel}>摘要</label>
              <p className={styles.viewValue}>{article.summary}</p>
            </div>

            <div className={styles.viewRow}>
              <div className={styles.viewField}>
                <label className={styles.viewLabel}>作者</label>
                <p className={styles.viewValue}>{article.author || '未设置'}</p>
              </div>

              <div className={styles.viewField}>
                <label className={styles.viewLabel}>发布日期</label>
                <p className={styles.viewValue}>{article.date}</p>
              </div>

              <div className={styles.viewField}>
                <label className={styles.viewLabel}>状态</label>
                <span className={`${styles.statusBadge} ${article.status === 'published' ? styles.statusPublished : styles.statusDraft}`}>
                  {article.status === 'published' ? '已发布' : '草稿'}
                </span>
              </div>
            </div>

            <div className={styles.viewField}>
              <label className={styles.viewLabel}>标签</label>
              <div className={styles.tagsList}>
                {article.tags && article.tags.length > 0 ? (
                  article.tags.map((tag, index) => (
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
                {article.contentFormat === 'markdown' ? 'Markdown' : 'HTML'}
              </p>
            </div>

            <div className={styles.viewField}>
              <label className={styles.viewLabel}>文章内容</label>
              <pre className={styles.contentPreview}>{article.content}</pre>
            </div>

            {article.image && (
              <div className={styles.viewField}>
                <label className={styles.viewLabel}>封面图片</label>
                <p className={styles.viewValue}>{article.image}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
