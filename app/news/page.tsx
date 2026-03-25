"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from '@/components/theme-provider'
import { Calendar, Clock } from 'lucide-react'

interface Article {
  id: string
  title: string
  summary: string
  date: string
  slug: string
  image?: string
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const { themeConfig } = useTheme()

  useEffect(() => {
    // 从API获取文章列表
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles')
        if (response.ok) {
          const data = await response.json()
          // 只显示已发布的文章并按日期排序
          const publishedArticles = data
            .filter((article: any) => article.status === 'published')
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          setArticles(publishedArticles)
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">资讯中心</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            最新行业动态、深度分析与实战案例
          </p>
        </div>
      </section>

      {/* Article List */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {articles.map((article, index) => (
              <div key={article.id} className="flex flex-col md:flex-row gap-6 pb-8 border-b border-gray-200 last:border-0">
                {/* Date Badge */}
                <div className="md:w-24 flex flex-col items-center justify-start">
                  <div className="text-3xl font-bold text-gray-900">
                    {new Date(article.date).getDate().toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(article.date).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'numeric'
                    })}
                  </div>
                </div>

                {/* Article Content */}
                <div className="flex-1">
                  <Link href={`/news/${article.slug}`} className="group">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {article.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.summary}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{article.date}</span>
                    </div>
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
