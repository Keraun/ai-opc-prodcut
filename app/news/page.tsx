"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from '@/components/theme-provider'
import { Header } from '@/components/common/header'
import { Footer } from '@/components/common/footer'
import styles from './news.module.css'

interface Article {
  id: string
  title: string
  summary: string
  date: string
  slug: string
  image?: string
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const { themeConfig } = useTheme()

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles')
        if (response.ok) {
          const data = await response.json()
          const publishedArticles = data
            .filter((article: any) => article.status === 'published')
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          setArticles(publishedArticles)
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>加载中...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>资讯中心</h1>
          <p className={styles.heroSubtitle}>
            最新行业动态、深度分析与实战案例
          </p>
        </div>
      </section>

      <section className={styles.main}>
        <div className={styles.mainContainer}>
          <div className={styles.articleList}>
            {articles.map((article, index) => (
              <div key={article.id} className={styles.articleItem}>
                <div className={styles.dateBadge}>
                  <div className={styles.dateDay}>
                    {new Date(article.date).getDate().toString().padStart(2, '0')}
                  </div>
                  <div className={styles.dateMonth}>
                    {new Date(article.date).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'numeric'
                    })}
                  </div>
                </div>

                <div className={styles.articleContent}>
                  <Link href={`/news/${article.slug}`} className={styles.articleLink}>
                    <h2 className={styles.articleTitle}>
                      {article.title}
                    </h2>
                    <p className={styles.articleSummary}>
                      {article.summary}
                    </p>
                    <div className={styles.articleMeta}>
                      <svg className={styles.articleMetaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{article.date}</span>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
