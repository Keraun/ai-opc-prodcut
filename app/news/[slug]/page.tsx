"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, ArrowLeft } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import ReactMarkdown from 'react-markdown'

interface Article {
  id: string
  title: string
  content: string
  contentFormat: 'html' | 'markdown'
  date: string
  author?: string
  tags?: string[]
}

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const { themeConfig } = useTheme()

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // 从API获取文章内容
        const response = await fetch(`/api/articles?slug=${slug}`)
        if (response.ok) {
          const foundArticle = await response.json()
          setArticle(foundArticle)
        } else {
          // 文章不存在，返回404
          router.push('/news')
        }
      } catch (error) {
        console.error('Failed to fetch article:', error)
        router.push('/news')
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">文章不存在</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/news')}
            className="flex items-center text-sm text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回资讯列表
          </button>
        </div>
      </div>

      {/* Article Content */}
      <article className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center text-sm text-gray-500 mb-8">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{article.date}</span>
            {article.author && (
              <span className="mx-2">•</span>
            )}
            {article.author && (
              <span>作者：{article.author}</span>
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="prose max-w-none">
            {article.contentFormat === 'markdown' ? (
              <ReactMarkdown>{article.content}</ReactMarkdown>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
