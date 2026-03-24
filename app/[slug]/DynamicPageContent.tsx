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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-150"
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
                  prose-headings:font-bold prose-headings:text-gray-900 prose-headings:scroll-mt-24
                  prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-16 prose-h1:first:mt-0 prose-h1:pb-4 prose-h1:border-b-2 prose-h1:border-indigo-100
                  prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12 prose-h2:text-gray-800 prose-h2:font-semibold
                  prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-10 prose-h3:text-gray-700 prose-h3:font-semibold
                  prose-p:text-gray-700 prose-p:leading-[2] prose-p:mb-8 prose-p:text-lg prose-p:font-normal
                  prose-a:text-indigo-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-2 prose-a:decoration-indigo-300
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-ul:my-8 prose-ol:my-8 prose-li:my-3 prose-li:text-gray-700 prose-li:text-lg
                  prose-blockquote:border-l-4 prose-blockquote:border-indigo-400 prose-blockquote:bg-gradient-to-r prose-blockquote:from-indigo-50 prose-blockquote:to-purple-50 prose-blockquote:py-5 prose-blockquote:px-8 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-gray-700 prose-blockquote:text-lg prose-blockquote:shadow-sm prose-blockquote:my-8
                  prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-2.5 prose-code:py-1 prose-code:rounded-md prose-code:text-base prose-code:font-mono prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-code:border prose-code:border-indigo-100
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:overflow-x-auto prose-pre:my-8 prose-pre:shadow-lg prose-pre:p-6
                  prose-hr:border-gray-200 prose-hr:my-12 prose-hr:border-t-2
                  prose-img:rounded-xl prose-img:shadow-lg prose-img:my-10 prose-img:border prose-img:border-gray-100
                  prose-table:rounded-lg prose-table:overflow-hidden prose-table:shadow-sm prose-table:border prose-table:border-gray-200 prose-table:my-8
                  prose-th:bg-gray-50 prose-th:text-gray-900 prose-th:font-semibold prose-th:px-6 prose-th:py-3 prose-th:border-b prose-th:border-gray-200
                  prose-td:px-6 prose-td:py-3 prose-td:border-b prose-td:border-gray-100 prose-td:text-gray-700
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
                  prose-headings:font-bold prose-headings:text-gray-900 prose-headings:scroll-mt-24
                  prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-16 prose-h1:first:mt-0 prose-h1:pb-4 prose-h1:border-b-2 prose-h1:border-indigo-100
                  prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12 prose-h2:text-gray-800 prose-h2:font-semibold
                  prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-10 prose-h3:text-gray-700 prose-h3:font-semibold
                  prose-p:text-gray-700 prose-p:leading-[2] prose-p:mb-8 prose-p:text-lg prose-p:font-normal
                  prose-a:text-indigo-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-2 prose-a:decoration-indigo-300
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-ul:my-8 prose-ol:my-8 prose-li:my-3 prose-li:text-gray-700 prose-li:text-lg
                  prose-blockquote:border-l-4 prose-blockquote:border-indigo-400 prose-blockquote:bg-gradient-to-r prose-blockquote:from-indigo-50 prose-blockquote:to-purple-50 prose-blockquote:py-5 prose-blockquote:px-8 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-gray-700 prose-blockquote:text-lg prose-blockquote:shadow-sm prose-blockquote:my-8
                  prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-2.5 prose-code:py-1 prose-code:rounded-md prose-code:text-base prose-code:font-mono prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-code:border prose-code:border-indigo-100
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:overflow-x-auto prose-pre:my-8 prose-pre:shadow-lg prose-pre:p-6
                  prose-hr:border-gray-200 prose-hr:my-12 prose-hr:border-t-2
                  prose-img:rounded-xl prose-img:shadow-lg prose-img:my-10 prose-img:border prose-img:border-gray-100
                  prose-table:rounded-lg prose-table:overflow-hidden prose-table:shadow-sm prose-table:border prose-table:border-gray-200 prose-table:my-8
                  prose-th:bg-gray-50 prose-th:text-gray-900 prose-th:font-semibold prose-th:px-6 prose-th:py-3 prose-th:border-b prose-th:border-gray-200
                  prose-td:px-6 prose-td:py-3 prose-td:border-b prose-td:border-gray-100 prose-td:text-gray-700
                "
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </article>
        </div>
        
        {/* Sidebar - Fixed Position */}
        {showTOC && tocItems.length > 0 && (
          <aside className="hidden xl:block fixed left-1/2 translate-x-[calc(24rem+50px)] top-60 w-56">
            <div className="sticky top-60">
              {/* Table of Contents */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <h3 className="text-base font-bold text-gray-900">
                    目录
                  </h3>
                </div>
                <nav className="space-y-1.5">
                  {tocItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToHeading(item.id)}
                      className={`block w-full text-left text-sm py-2 px-3 rounded-lg transition-all duration-200 ${
                        activeId === item.id
                          ? 'text-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 font-semibold shadow-sm border-l-2 border-indigo-400'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l-2 border-transparent'
                      }`}
                      style={{ paddingLeft: `${(item.level - 1) * 16 + 12}px` }}
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
