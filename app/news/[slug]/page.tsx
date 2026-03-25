"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTheme } from '@/components/theme-provider'
import { Header } from '@/components/common/header'
import { Footer } from '@/components/common/footer'
import { Tag } from '@arco-design/web-react'
import ReactMarkdown from 'react-markdown'
import styles from './article.module.css'

interface Article {
  id: string
  title: string
  content: string
  contentFormat: 'html' | 'markdown'
  date: string
  author?: string
  tags?: string[]
}

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const { themeConfig } = useTheme()

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles?slug=${slug}`)
        if (response.ok) {
          const foundArticle = await response.json()
          setArticle(foundArticle)
        } else {
          router.push('/news')
        }
      } catch (error) {
        console.error('Failed to fetch article:', error)
        router.push('/news')
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug, router])

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>加载中...</div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>文章不存在</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.breadcrumb}>
        <div className={styles.breadcrumbContainer}>
          <button
            onClick={() => router.push('/news')}
            className={styles.backButton}
          >
            <svg className={styles.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回资讯列表
          </button>
        </div>
      </div>

      <article className={styles.article}>
        <div className={styles.articleContainer}>
          <h1 className={styles.articleTitle}>
            {article.title}
          </h1>

          <div className={styles.articleMeta}>
            <svg className={styles.metaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{article.date}</span>
            {article.author && (
              <>
                <span className={styles.metaDivider}>•</span>
                <span>作者：{article.author}</span>
              </>
            )}
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className={styles.articleTags}>
              {article.tags.map((tag, index) => (
                <Tag key={index} color="blue">
                  {tag}
                </Tag>
              ))}
            </div>
          )}

          <div className={styles.articleContent}>
            {article.contentFormat === 'markdown' ? (
              <ReactMarkdown>{article.content}</ReactMarkdown>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            )}
          </div>
        </div>
      </article>

      <Footer />
    </div>
  )
}
