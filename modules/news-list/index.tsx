import Link from 'next/link'
import type { ModuleProps } from '@/modules/types'
import type { NewsListData, Article } from './types'
import styles from './index.module.css'

export function NewsListModule({ data }: ModuleProps) {
  const config: NewsListData = (data as NewsListData) || {
    title: '资讯中心',
    subtitle: '最新行业动态、深度分析与实战案例',
    showDate: true,
    showSummary: true,
    itemsPerPage: 10,
    articles: []
  }

  const { articles = [] } = config

  return (
    <div className={styles.newsList}>
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>{config.title}</h1>
          <p className={styles.heroSubtitle}>
            {config.subtitle}
          </p>
        </div>
      </section>

      <section className={styles.main}>
        <div className={styles.mainContainer}>
          <div className={styles.articleList}>
            {articles.map((article) => (
              <div key={article.id} className={styles.articleItem}>
                {config.showDate && (
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
                )}

                <div className={styles.articleContent}>
                  <Link href={`/news/${article.slug}`} className={styles.articleLink}>
                    <h2 className={styles.articleTitle}>
                      {article.title}
                    </h2>
                    {config.showSummary && (
                      <p className={styles.articleSummary}>
                        {article.summary}
                      </p>
                    )}
                    {config.showDate && (
                      <div className={styles.articleMeta}>
                        <svg className={styles.articleMetaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{article.date}</span>
                      </div>
                    )}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}