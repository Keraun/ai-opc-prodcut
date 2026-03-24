"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState, useEffect } from 'react'
import { Header } from '@/components/common/header'
import { Footer } from '@/components/common/footer'

interface PageConfig {
  title: string
  description?: string
  contentType: 'markdown' | 'html'
  content: string
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
  const { title, description, contentType, content } = pageConfig
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
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>
      
      <main className="pt-20">
        {/* Main Content - Centered */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            {title}
          </h1>
          
          {/* Description */}
          {description && (
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              {description}
            </p>
          )}
          
          {/* Content */}
          <article className="pb-16">
            {contentType === 'markdown' ? (
              <div 
                className="prose prose-lg max-w-none
                  prose-headings:font-bold prose-headings:text-gray-900 
                  prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-12 prose-h1:first:mt-0 prose-h1:pb-3 prose-h1:border-b prose-h1:border-gray-100
                  prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:scroll-mt-24
                  prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-8 prose-h3:scroll-mt-24
                  prose-p:text-gray-700 prose-p:leading-[1.8] prose-p:mb-6 prose-p:text-[1.125rem]
                  prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-2
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-ul:my-6 prose-ol:my-6 prose-li:my-2 prose-li:text-gray-700 prose-li:text-[1.125rem]
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-gray-700 prose-blockquote:text-[1.125rem]
                  prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-6
                  prose-hr:border-gray-200 prose-hr:my-12
                  prose-img:rounded-lg prose-img:shadow-sm prose-img:my-8
                "
              >
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
              <div 
                className="prose prose-lg max-w-none
                  prose-headings:font-bold prose-headings:text-gray-900 
                  prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-12 prose-h1:first:mt-0 prose-h1:pb-3 prose-h1:border-b prose-h1:border-gray-100
                  prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:scroll-mt-24
                  prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-8 prose-h3:scroll-mt-24
                  prose-p:text-gray-700 prose-p:leading-[1.8] prose-p:mb-6 prose-p:text-[1.125rem]
                  prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-2
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-ul:my-6 prose-ol:my-6 prose-li:my-2 prose-li:text-gray-700 prose-li:text-[1.125rem]
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-gray-700 prose-blockquote:text-[1.125rem]
                  prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-6
                  prose-hr:border-gray-200 prose-hr:my-12
                  prose-img:rounded-lg prose-img:shadow-sm prose-img:my-8
                "
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </article>
        </div>
        
        {/* Sidebar - Fixed Position */}
        {tocItems.length > 0 && (
          <aside className="hidden xl:block fixed left-1/2 translate-x-[calc(24rem+50px)] top-60 w-64">
            <div className="sticky top-60">
              {/* Table of Contents */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                  目录
                </h3>
                <nav className="space-y-2">
                  {tocItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToHeading(item.id)}
                      className={`block w-full text-left text-sm py-1.5 px-3 rounded transition-colors ${
                        activeId === item.id
                          ? 'text-blue-600 bg-blue-50 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
                    >
                      {item.text}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </aside>
        )}
      </main>
      
      <Footer />
    </div>
  )
}
