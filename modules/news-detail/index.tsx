'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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
  contentType: 'html' | 'markdown'
}

// 预览模式下的模拟文章数据
const previewArticle: Article = {
  id: 1,
  title: '示例文章标题',
  slug: 'preview-article',
  summary: '这是一篇示例文章的摘要，用于预览模式展示。',
  content: '<p>这是示例文章的正文内容。在预览模式下，我们展示一些示例内容来演示资讯详情模块的样式和布局。</p><p>您可以配置是否显示作者、日期、相关文章等选项。</p>',
  date: new Date().toISOString().split('T')[0],
  author: '示例作者',
  category: '示例分类',
  tags: ['标签1', '标签2'],
  image: '',
  viewCount: 100,
  status: 'published',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  contentType: 'html'
}

export function NewsDetailModule({ data }: ModuleProps) {
  const config: NewsDetailData = (data as unknown as NewsDetailData) || {
    showAuthor: true,
    showDate: true,
    showRelated: true,
    relatedCount: 4,
    showComments: false
  }

  const ssrArticle = (data as any)?.ssrArticle as Article | undefined

  const [article, setArticle] = useState<Article | null>(ssrArticle || null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [prevArticle, setPrevArticle] = useState<Article | null>(null)
  const [nextArticle, setNextArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(!ssrArticle)
  const [isPreview, setIsPreview] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [savedArticleId, setSavedArticleId] = useState<number | null>(null)
  const fullscreenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchArticle = async () => {
      const isPreviewMode = window.location.pathname.includes('/admin/module-preview/') || window.location.pathname.includes('/admin/page-preview/')
      setIsPreview(isPreviewMode)
      
      if (isPreviewMode) {
        try {
            const response = await fetch('/api/articles?id=0')
          const result = await response.json()
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
          } else {
            setArticle(previewArticle)
            setRelatedArticles([])
            setPrevArticle(null)
            setNextArticle(null)
          }
        } catch {
          setArticle(previewArticle)
          setRelatedArticles([])
          setPrevArticle(null)
          setNextArticle(null)
        }
        setLoading(false)
        return
      }

      if (ssrArticle) {
        try {
          const listResponse = await fetch('/api/articles')
          const listResult = await listResponse.json()
          if (listResult.success && listResult.data) {
            const allArticles = listResult.data
            const currentIndex = allArticles.findIndex((a: Article) => a.id === ssrArticle.id)
            
            if (config.showRelated) {
              setRelatedArticles(
                allArticles
                  .filter((a: Article) => a.id !== ssrArticle.id)
                  .slice(0, config.relatedCount || 4)
              )
            }
            
            setPrevArticle(currentIndex > 0 ? allArticles[currentIndex - 1] : null)
            setNextArticle(currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null)
          }
        } catch (error) {
          console.error('Failed to fetch related articles:', error)
        } finally {
          setLoading(false)
        }
        return
      }

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
  }, [config.showRelated, config.relatedCount, ssrArticle])

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>加载中...</p>
      </div>
    )
  }

  const handleFullscreenToggle = () => {
    if (!isFullscreen) {
      if (fullscreenRef.current) {
        if (fullscreenRef.current.requestFullscreen) {
          fullscreenRef.current.requestFullscreen()
        } else if ((fullscreenRef.current as any).webkitRequestFullscreen) {
          (fullscreenRef.current as any).webkitRequestFullscreen()
        } else if ((fullscreenRef.current as any).mozRequestFullScreen) {
          (fullscreenRef.current as any).mozRequestFullScreen()
        } else if ((fullscreenRef.current as any).msRequestFullscreen) {
          (fullscreenRef.current as any).msRequestFullscreen()
        }
        setIsFullscreen(true)
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  const handleSaveArticle = async () => {
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(article)
      })
      const result = await response.json()
      if (result.success) {
        setSavedArticleId(result.data.id)
        setShowSaveModal(true)
      } else {
        alert('资讯保存失败：' + result.message)
      }
    } catch (error) {
      console.error('Failed to save article:', error)
      alert('资讯保存失败，请重试')
    }
  }

  const handleViewDetail = () => {
    setShowSaveModal(false)
    window.open(`/news/${savedArticleId}`, '_blank')
  }

  const handleEditArticle = () => {
    setShowSaveModal(false)
    window.location.href = `/admin/articles/edit/${savedArticleId}`
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
    <div className={`${styles.newsDetail} ${isFullscreen ? styles.fullscreen : ''}`} ref={fullscreenRef}>
      <div className={styles.container}>
        <div className={styles.articleActions}>
          <button 
            className={styles.actionButton} 
            onClick={handleFullscreenToggle}
            title={isFullscreen ? '退出全屏' : '全屏查看'}
          >
            <svg 
              className={styles.actionIcon} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
              )}
            </svg>
            {isFullscreen ? '退出全屏' : '全屏查看'}
          </button>
          <button 
            className={styles.actionButton} 
            onClick={handleSaveArticle}
            title="保存资讯"
          >
            <svg 
              className={styles.actionIcon} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            保存资讯
          </button>
        </div>
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
              {article.category && (
                <div className={styles.articleMetaItem}>
                  <svg className={styles.articleMetaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{article.category}</span>
                </div>
              )}
            </div>
            {article.tags && article.tags.length > 0 && (
              <div className={styles.articleTags}>
                {article.tags.map((tag, index) => (
                  <span key={index} className={styles.articleTag}>{tag}</span>
                ))}
              </div>
            )}
            {article.image && (
              <img 
                src={article.image} 
                alt={article.title} 
                className={styles.articleImage}
              />
            )}
          </header>
          
          <div className={styles.articleContent}>
            <div className={styles.articleSummary}>
              <h3>摘要</h3>
              <p>{article.summary}</p>
            </div>
            {article.contentType === 'markdown' ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            )}
          </div>
        </article>

        {(prevArticle || nextArticle) && (
          <div className={styles.navigationSection}>
            {prevArticle ? (
              <Link href={`/news/${prevArticle.id}`} className={`${styles.navItem} ${styles.prevItem}`}>
                <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <div className={styles.navContent}>
                  <div className={styles.navLabel}>上一篇</div>
                  <div className={styles.navTitle}>{prevArticle.title}</div>
                </div>
              </Link>
            ) : <div></div>}
            {nextArticle ? (
              <Link href={`/news/${nextArticle.id}`} className={`${styles.navItem} ${styles.nextItem}`}>
                <div className={styles.navContent}>
                  <div className={styles.navLabel}>下一篇</div>
                  <div className={styles.navTitle}>{nextArticle.title}</div>
                </div>
                <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ): <div></div>}
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

      {showSaveModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className={styles.modalTitle}>资讯保存成功</h2>
              <p className={styles.modalText}>您的资讯已成功保存到系统中</p>
              <div className={styles.modalActions}>
                <button 
                  className={`${styles.modalButton} ${styles.modalButtonSecondary}`}
                  onClick={handleViewDetail}
                >
                  查看详情
                </button>
                <button 
                  className={`${styles.modalButton} ${styles.modalButtonPrimary}`}
                  onClick={handleEditArticle}
                >
                  去编辑
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
