"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState, useEffect } from 'react'
import { Header } from '@/components/common/header'
import { Footer } from '@/components/common/footer'
import styles from './dynamic-page.module.css'

interface PageConfig {
  title: string
  description?: string
  contentType: 'markdown' | 'html'
  content: string
  showTOC?: boolean
}

interface DynamicPageContentProps {
  pageConfig: PageConfig
  slug: string
}

interface TOCItem {
  id: string
  text: string
  level: number
}

export default function DynamicPageContent({ pageConfig, slug }: DynamicPageContentProps) {
  const { title, description, contentType, content, showTOC = true } = pageConfig
  const [readingProgress, setReadingProgress] = useState(0)
  const [tocItems, setTocItems] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setReadingProgress(Math.min(100, Math.max(0, progress)))
    }

    window.addEventListener('scroll', updateProgress)
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  useEffect(() => {
    if (contentType === 'markdown') {
      const headings = content.match(/^#{1,3}\s+.+$/gm) || []
      const items = headings.map((heading, index) => {
        const level = heading.match(/^#+/)?.[0].length || 1
        const text = heading.replace(/^#+\s+/, '')
        const id = `heading-${index}`
        return { id, text, level }
      })
      setTocItems(items)
    }
  }, [content, contentType])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0% -35% 0%' }
    )

    const headings = document.querySelectorAll('h1, h2, h3')
    headings.forEach((heading) => observer.observe(heading))

    return () => observer.disconnect()
  }, [content])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${readingProgress}%` }}
        />
      </div>
      
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            {title}
          </h1>
          
          {description && (
            <p className={styles.description}>
              {description}
            </p>
          )}
          
          <article className={styles.article}>
            {contentType === 'markdown' ? (
              <div>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 id={`heading-${tocItems.findIndex(item => item.text === children?.toString())}`}>{children}</h1>,
                    h2: ({ children }) => <h2 id={`heading-${tocItems.findIndex(item => item.text === children?.toString())}`}>{children}</h2>,
                    h3: ({ children }) => <h3 id={`heading-${tocItems.findIndex(item => item.text === children?.toString())}`}>{children}</h3>,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            )}
          </article>
        </div>
        
        {showTOC && tocItems.length > 0 && (
          <aside className={styles.sidebar}>
            <div className={styles.tocContainer}>
              <div className={styles.tocHeader}>
                <svg className={styles.tocIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <h3 className={styles.tocTitle}>
                  目录
                </h3>
              </div>
              <nav className={styles.tocNav}>
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToHeading(item.id)}
                    className={`${styles.tocItem} ${activeId === item.id ? styles.tocItemActive : styles.tocItemInactive}`}
                    style={{ paddingLeft: `${(item.level - 1) * 16 + 12}px` }}
                  >
                    {item.text}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </main>

      <Footer />
    </div>
  )
}
