"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button, Card, Spin } from "@arco-design/web-react"
import { IconLeft } from "@arco-design/web-react/icon"
import { toast } from "sonner"
import { DynamicForm } from "@/components/dynamic-form"
import { getSchema, getArticleById, updateArticle } from "@/lib/api-client"
import styles from "../../articles.module.css"

interface FormSchema {
  title: string
  description?: string
  type: string
  properties: Record<string, any>
  required?: string[]
  ui?: any
}

interface Article {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  contentFormat: 'html' | 'markdown'
  date: string
  author?: string
  tags?: string[]
  image?: string
  status: 'published' | 'draft'
}

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string
  
  const [schema, setSchema] = useState<FormSchema | null>(null)
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSchema()
    fetchArticle()
  }, [articleId])

  const fetchSchema = async () => {
    try {
      const schemaData = await getSchema('article')
      setSchema(schemaData as unknown as FormSchema)
    } catch (error) {
      console.error('Failed to fetch schema:', error)
      toast.error('加载表单配置失败')
    }
  }

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const data = await getArticleById(articleId)
      if (data) {
        setArticle(data)
      } else {
        toast.error('文章不存在')
        router.push('/admin/articles')
      }
    } catch (error) {
      console.error('Failed to fetch article:', error)
      toast.error('加载文章失败')
      router.push('/admin/articles')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: Record<string, any>) => {
    setSubmitting(true)
    try {
      const result = await updateArticle({
        ...values,
        id: articleId
      })
      
      if (result.success) {
        toast.success('文章更新成功')
        router.push('/admin/articles')
      } else {
        toast.error('保存文章失败')
      }
    } catch (error) {
      console.error('Failed to save article:', error)
      toast.error('保存文章失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/articles')
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size={40} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="text"
              icon={<IconLeft />}
              onClick={handleCancel}
            >
              返回文章列表
            </Button>
            <h1 className={styles.headerTitle}>编辑文章</h1>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <Card className={styles.formCard}>
          {schema && article && (
            <DynamicForm
              schema={schema}
              initialValues={article}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={submitting}
            />
          )}
        </Card>
      </div>
    </div>
  )
}
