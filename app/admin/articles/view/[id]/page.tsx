"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button, Card, Spin } from "@arco-design/web-react"
import { ChevronLeft as IconChevronLeft, Edit as IconEdit } from "lucide-react"
import { toast } from "sonner"
import styles from "../../articles.module.css"

interface Article {
  id: string
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
      const result = await response.json()
      if (result.success && result.data) {
        setArticle(result.data)
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
              icon={<IconChevronLeft />}
              onClick={handleBack}
              style={{ color: 'white' }}
            >
              返回文章列表
            </Button>
            <h1 className={styles.headerTitle}>{article.title}</h1>
          </div>
          <Button
            type="primary"
            icon={<IconEdit size={16} />}
            onClick={handleEdit}
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
                <p className={styles.viewValue}>{article.title}</p>
              </div>
              <div className={styles.viewRow}>
                <div className={styles.viewField}>
                  <label className={styles.viewLabel}>URL别名</label>
                  <p className={styles.viewValue}>{article.slug}</p>
                </div>
                <div className={styles.viewField}>
                  <label className={styles.viewLabel}>文章分类</label>
                  <p className={styles.viewValue}>{article.category ? getCategoryName(article.category) : '未分类'}</p>
                </div>
                <div className={styles.viewField}>
                  <label className={styles.viewLabel}>状态</label>
                  <span className={`${styles.statusBadge} ${article.status === 'published' ? styles.statusPublished : styles.statusDraft}`}>
                    {article.status === 'published' ? '已发布' : '草稿'}
                  </span>
                </div>
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
              </div>
              <div className={styles.viewField}>
                <label className={styles.viewLabel}>文章摘要</label>
                <p className={styles.viewValue}>{article.summary}</p>
              </div>
            </div>

            <div className={styles.viewSection}>
              <h3 className={styles.sectionTitle}>媒体</h3>
              <div className={styles.viewField}>
                <label className={styles.viewLabel}>封面图片</label>
                {article.image ? (
                  <div className={styles.imagePreview}>
                    <img src={article.image} alt={article.title} />
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
                  {article.tags && article.tags.length > 0 ? (
                    article.tags.map((tag, index) => (
                      <span key={index} className={styles.tagItem}>{tag}</span>
                    ))
                  ) : (
                    <span className={styles.noTags}>无标签</span>
                  )}
                </div>
              </div>
            </div>

            {article.content && (
              <div className={styles.viewSection}>
                <h3 className={styles.sectionTitle}>文章内容</h3>
                <div 
                  className={styles.htmlContent}
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>
            )}

            <div className={styles.viewSection}>
              <h3 className={styles.sectionTitle}>时间信息</h3>
              <div className={styles.viewRow}>
                <div className={styles.viewField}>
                  <label className={styles.viewLabel}>创建时间</label>
                  <p className={styles.viewValue}>{formatDate(article.created_at)}</p>
                </div>
                <div className={styles.viewField}>
                  <label className={styles.viewLabel}>更新时间</label>
                  <p className={styles.viewValue}>{formatDate(article.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
