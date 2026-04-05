import { readConfig } from '@/lib/config-manager'

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
  mainImage?: string
  viewCount?: number
  status: string
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}

interface CrawlerArticleProps {
  article: Article
}

export function CrawlerArticle({ article }: CrawlerArticleProps) {
  const siteConfig = readConfig('site') || {}
  const baseUrl = siteConfig?.url || 'http://localhost:3000'
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.summary,
    "image": article.mainImage || article.image ? [`${baseUrl}${article.mainImage || article.image}`] : [],
    "datePublished": article.date,
    "dateModified": article.date,
    "author": {
      "@type": "Person",
      "name": article.author || "未知作者"
    },
    "publisher": {
      "@type": "Organization",
      "name": siteConfig?.name || "网站",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/news/${article.id}`
    }
  }

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <template>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </template>
      
      <header>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', lineHeight: '1.3' }}>
          {article.title}
        </h1>
        
        <div style={{ marginBottom: '1.5rem', color: '#666', fontSize: '0.875rem' }}>
          {article.author && (
            <span style={{ marginRight: '1rem' }}>
              作者: {article.author}
            </span>
          )}
          <span style={{ marginRight: '1rem' }}>
            发布时间: {article.date}
          </span>
          {article.category && (
            <span style={{ marginRight: '1rem' }}>
              分类: {article.category}
            </span>
          )}
          {article.viewCount !== undefined && (
            <span>
              阅读量: {article.viewCount}
            </span>
          )}
        </div>
        
        {article.tags && article.tags.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            {article.tags.map((tag, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  marginRight: '0.5rem',
                  marginBottom: '0.5rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  color: '#374151'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {(article.mainImage || article.image) && (
          <img
            src={article.mainImage || article.image}
            alt={article.title}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '400px',
              objectFit: 'cover',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}
          />
        )}
      </header>
      
      <div
        style={{
          lineHeight: '1.8',
          color: '#374151',
          fontSize: '1rem'
        }}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
      
      <footer style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          <p>本文首发于 {siteConfig?.name || '本站'}</p>
          <p>转载请注明出处：{baseUrl}/news/{article.id}</p>
        </div>
      </footer>
    </article>
  )
}
