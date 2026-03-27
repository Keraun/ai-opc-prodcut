import Link from 'next/link'
import type { ModuleProps } from '@/modules/types'
import type { NewsDetailData } from './types'
import styles from './index.module.css'

export function NewsDetailModule({ data }: ModuleProps) {
  const config: NewsDetailData = (data as NewsDetailData) || {}

  const { article, relatedArticles } = config

  if (!article) {
    return (
      <div className={styles.error}>
        <div className={styles.errorText}>
          文章不存在
        </div>
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
          
          <div className={styles.articleContent}>
            {article.content}
          </div>
          
          {config.showShare && (
            <div className={styles.shareSection}>
              <h3 className={styles.shareTitle}>分享文章</h3>
              <div className={styles.shareButtons}>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`} className={styles.shareButton} target="_blank" rel="noopener noreferrer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                  Twitter
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} className={styles.shareButton} target="_blank" rel="noopener noreferrer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  Facebook
                </a>
                <a href={`mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(window.location.href)}`} className={styles.shareButton}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Email
                </a>
              </div>
            </div>
          )}
        </article>
        
        {config.showRelated && relatedArticles && relatedArticles.length > 0 && (
          <div className={styles.relatedSection}>
            <h3 className={styles.relatedTitle}>相关文章</h3>
            <div className={styles.relatedList}>
              {relatedArticles.map((related) => (
                <div key={related.id} className={styles.relatedItem}>
                  <Link href={`/news/${related.slug}`} className={styles.relatedLink}>
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
