'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { ModuleProps } from '@/modules/types'
import type { NewsListData, Article } from './types'
import styles from './index.module.css'

const DEFAULT_ARTICLE_IMAGE = `data:image/svg+xml,${encodeURIComponent(`
<svg width="400" height="200" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="200" fill="url(#gradient)"/>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" />
    </linearGradient>
  </defs>
  <g transform="translate(160, 50)">
    <rect x="0" y="0" width="80" height="60" rx="4" fill="rgba(255,255,255,0.2)"/>
    <rect x="10" y="70" width="60" height="8" rx="2" fill="rgba(255,255,255,0.3)"/>
    <rect x="10" y="84" width="40" height="6" rx="2" fill="rgba(255,255,255,0.2)"/>
  </g>
  <text x="200" y="170" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="system-ui, sans-serif" font-size="16" font-weight="500">资讯文章</text>
</svg>
`)}`

export function NewsListModule({ data }: ModuleProps) {
  const config: NewsListData = (data as unknown as NewsListData) || {
    title: '资讯中心',
    subtitle: '最新行业动态、深度分析与实战案例',
    showDate: true,
    showSummary: true,
    itemsPerPage: 10
  }

  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles')
        const result = await response.json()
        if (result.success && result.data) {
          setArticles(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [])

  const handleImageError = (articleId: number) => {
    setImageErrors(prev => new Set(prev).add(articleId))
  }

  const getArticleImage = (article: Article) => {
    if (!article.image || imageErrors.has(article.id)) {
      return DEFAULT_ARTICLE_IMAGE
    }
    return article.image
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('zh-CN', { month: 'short' }),
      year: date.getFullYear()
    }
  }

  return (
    <div className={styles.newsList}>
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>{config.title}</h1>
          <p className={styles.heroSubtitle}>{config.subtitle}</p>
        </div>
      </section>

      <section className={styles.main}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>加载中...</p>
          </div>
        ) : articles.length > 0 ? (
          <div className={styles.articleGrid}>
            {articles.map((article, index) => {
              const dateInfo = formatDate(article.date)
              return (
                <Link 
                  key={article.id} 
                  href={`/news/${article.slug}`}
                  className={styles.articleCard}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={styles.cardImage}>
                    <img 
                      src={getArticleImage(article)} 
                      alt={article.title}
                      onError={() => handleImageError(article.id)}
                    />
                    <div className={styles.cardOverlay}></div>
                  </div>
                  
                  <div className={styles.cardContent}>
                    {config.showDate && (
                      <div className={styles.dateBadge}>
                        <span className={styles.dateDay}>{dateInfo.day}</span>
                        <span className={styles.dateMonth}>{dateInfo.month}</span>
                      </div>
                    )}
                    
                    <div className={styles.cardBody}>
                      {article.category && (
                        <span className={styles.categoryTag}>{article.category}</span>
                      )}
                      
                      <h2 className={styles.articleTitle}>{article.title}</h2>
                      
                      {config.showSummary && (
                        <p className={styles.articleSummary}>{article.summary}</p>
                      )}
                      
                      <div className={styles.cardMeta}>
                        {article.author && (
                          <span className={styles.metaItem}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            {article.author}
                          </span>
                        )}
                        <span className={styles.metaItem}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          {article.viewCount || 0} 阅读
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h10" />
              </svg>
            </div>
            <p className={styles.emptyText}>暂无资讯</p>
          </div>
        )}
      </section>
    </div>
  )
}
