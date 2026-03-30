"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Header } from '@/components/common/header'
import { Footer } from '@/components/common/footer'
import styles from './dynamic-page.module.css'

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

export default function DynamicPageContent({ pageConfig, slug }: DynamicPageContentProps) {
  const { title, description, contentType, content } = pageConfig

  return (
    <div className={styles.container}>
      <Header />
      
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
                >
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            )}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}
