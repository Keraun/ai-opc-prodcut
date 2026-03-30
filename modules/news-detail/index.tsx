'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { ModuleProps } from '@/modules/types'
import type { NewsDetailData } from './types'
import styles from './index.module.css'

interface Article {
  id: number
  title: string
  slug: string
  summary: string
  content: string
  date: string
  author?: string
  category?: string
  tags?: string[]
  image?: string
  viewCount?: number
  status: string
  created_at: string
  updated_at: string
}

export function NewsDetailModule({ data }: ModuleProps) {
  const config: NewsDetailData = (data as NewsDetailData) || {
    showAuthor: true,
    showDate: true,
    showRelated: true,
    relatedCount: 4,
    showComments: false
  }

  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [prevArticle, setPrevArticle] = useState<Article | null>(null)
  const [nextArticle, setNextArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticle = async () => {
      const param = window.location.pathname.split('/').pop()
      if (!param) return

      try {
        let response = await fetch(`/api/articles?id=${param}`)
        let result = await response.json()
        
        if (!result.success || !result.data) {
          response = await fetch(`/api/articles?slug=${param}`)
          result = await response.json()
        }
        
        if (result.success && result.data) {
          setArticle(result.data)
          
          const listResponse = await fetch('/api/articles')
          const listResult = await listResponse.json()
          if (listResult.success && listResult.data) {
            const allArticles = listResult.data
            const currentIndex = allArticles.findIndex((a: Article) => a.id === result.data.id)
            
            if (config.showRelated) {
              setRelatedArticles(
                allArticles
                  .filter((a: Article) => a.id !== result.data.id)
                  .slice(0, config.relatedCount || 4)
              )
            }
            
            setPrevArticle(currentIndex > 0 ? allArticles[currentIndex - 1] : null)
            setNextArticle(currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null)
          }
        }
      } catch (error) {
        console.error('Failed to fetch article:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [config.showRelated, config.relatedCount])

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>加载中...</p>
      </div>
    )
  }

  if (!article) {
    return (
      <div className={styles.error}>
        <div className={styles.errorIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className={styles.errorTitle}>文章不存在</h2>
        <p className={styles.errorText}>抱歉，您访问的文章不存在</p>
        <a href="/news" className={styles.errorButton}>返回资讯列表</a>
      </div>
    )
  }

  return (
    <div className={styles.newsDetail}>
      <div className={styles.container}>
        <article className={styles.article}>
          <header className={styles.articleHeader}>
            <h1 className={styles.articleTitle}>{article.title}</h1>
            <div className={styles.articleMeta}>
              {config.showAuthor && article.author && (
                <div className={styles.articleMetaItem}>
                  <svg className={styles.articleMetaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{article.author}</span>
                </div>
              )}
              {config.showDate && (
                <div className={styles.articleMetaItem}>
                  <svg className={styles.articleMetaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{article.date}</span>
                </div>
              )}
            </div>
            {article.image && (
              <img 
                src={article.image} 
                alt={article.title} 
                className={styles.articleImage}
              />
            )}
          </header>
          
          <div className={styles.articleContent} dangerouslySetInnerHTML={{ __html: article.content }} />
        </article>

        {(prevArticle || nextArticle) && (
          <div className={styles.navigationSection}>
            {prevArticle && (
              <Link href={`/news/${prevArticle.id}`} className={`${styles.navItem} ${styles.prevItem}`}>
                <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <div className={styles.navContent}>
                  <div className={styles.navLabel}>上一篇</div>
                  <div className={styles.navTitle}>{prevArticle.title}</div>
                </div>
              </Link>
            )}
            {nextArticle && (
              <Link href={`/news/${nextArticle.id}`} className={`${styles.navItem} ${styles.nextItem}`}>
                <div className={styles.navContent}>
                  <div className={styles.navLabel}>下一篇</div>
                  <div className={styles.navTitle}>{nextArticle.title}</div>
                </div>
                <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        )}
        
        {config.showRelated && relatedArticles && relatedArticles.length > 0 && (
          <div className={styles.relatedSection}>
            <h3 className={styles.relatedTitle}>相关文章</h3>
            <div className={styles.relatedList}>
              {relatedArticles.map((related) => (
                <div key={related.id} className={styles.relatedItem}>
                  <Link 
                    href={`/news/${related.id}`} 
                    className={styles.relatedLink}
                  >
                    <h4 className={styles.relatedItemTitle}>{related.title}</h4>
                    {config.showDate && (
                      <div className={styles.relatedItemMeta}>
                        {related.date}
                      </div>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {config.showComments && (
          <div className={styles.commentsSection}>
            <h3 className={styles.commentsTitle}>评论</h3>
            <p>评论功能即将上线</p>
          </div>
        )}
      </div>
    </div>
  )
}
