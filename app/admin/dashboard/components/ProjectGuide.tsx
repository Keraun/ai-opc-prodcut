'use client'

import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styles from './ProjectGuide.module.css'

interface Heading {
  id: string
  text: string
  level: number
}

export function ProjectGuide() {
  const [content, setContent] = useState<string>('')
  const [headings, setHeadings] = useState<Heading[]>([])
  const [loading, setLoading] = useState(true)
  const [activeHeading, setActiveHeading] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadGuide() {
      try {
        const response = await fetch('/PROJECT_GUIDE.md')
        if (response.ok) {
          const text = await response.text()
          setContent(text)
          extractHeadings(text)
        } else {
          setContent('# 项目使用手册\n\n文档加载失败，请稍后重试。')
        }
      } catch (error) {
        console.error('Failed to load project guide:', error)
        setContent('# 项目使用手册\n\n文档加载失败，请稍后重试。')
      } finally {
        setLoading(false)
      }
    }

    loadGuide()
  }, [])

  const extractHeadings = (md: string) => {
    const headingRegex = /^(#{2,3})\s+(.+)$/gm
    const extractedHeadings: Heading[] = []
    let match

    while ((match = headingRegex.exec(md)) !== null) {
      const level = match[1].length
      const text = match[2]
      const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      extractedHeadings.push({ id, text, level })
    }

    setHeadings(extractedHeadings)
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveHeading(id)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [headings])

  const renderers = {
    h2: ({ children, ...props }: any) => {
      const id = children?.toString().toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-') || ''
      return <h2 id={id} {...props}>{children}</h2>
    },
    h3: ({ children, ...props }: any) => {
      const id = children?.toString().toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-') || ''
      return <h3 id={id} {...props}>{children}</h3>
    },
  }

  if (loading) {
    return (
      <div className={styles.guideContainer}>
        <div>加载中...</div>
      </div>
    )
  }

  return (
    <div className={styles.guideContainer}>
      <div ref={contentRef} className={styles.markdownContent}>
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          components={renderers}
        >
          {content}
        </ReactMarkdown>
      </div>
      {headings.length > 0 && (
        <nav className={styles.toc}>
          <div className={styles.tocTitle}>目录</div>
          <ul className={styles.tocList}>
            {headings.map((heading) => (
              <li
                key={heading.id}
                className={`${styles.tocItem} ${heading.level === 3 ? styles.tocItemLevel3 : ''} ${activeHeading === heading.id ? styles.tocItemActive : ''}`}
              >
                <button onClick={() => scrollToHeading(heading.id)}>
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
