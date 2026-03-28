"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Message } from "@arco-design/web-react"
import { ChevronLeft as IconChevronLeft } from "lucide-react"
import { toast } from "sonner"
import { DynamicForm } from "@/components/dynamic-form"
import { getSchema, createArticle } from "@/lib/api-client"
import styles from "../articles.module.css"

interface FormSchema {
  title: string
  description?: string
  type: string
  properties: Record<string, any>
  required?: string[]
  ui?: any
}

export default function NewArticlePage() {
  const router = useRouter()
  const [schema, setSchema] = useState<FormSchema | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSchema()
  }, [])

  const fetchSchema = async () => {
    try {
      const schemaData = await getSchema('article')
      setSchema(schemaData as unknown as FormSchema)
    } catch (error) {
      console.error('Failed to fetch schema:', error)
      toast.error('加载表单配置失败')
    }
  }

  const handleSubmit = async (values: Record<string, any>) => {
    setSubmitting(true)
    try {
      const result = await createArticle(values)
      
      if (result.success) {
        toast.success('文章创建成功')
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="text"
              icon={<IconChevronLeft />}
              onClick={handleCancel}
            >
              返回文章列表
            </Button>
            <h1 className={styles.headerTitle}>新建文章</h1>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <Card className={styles.formCard}>
          {schema && (
            <DynamicForm
              schema={schema}
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
