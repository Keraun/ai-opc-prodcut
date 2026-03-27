"use client"

import { useState, useEffect } from "react"
import { Button, Card, Modal, Message, Spin } from "@arco-design/web-react"
import { IconSave, IconEye, IconCode } from "@arco-design/web-react/icon"
import { toast } from "sonner"
import { DynamicForm } from "@/components/dynamic-form"
import styles from "./ConfigFormEditor.module.css"

interface FormSchema {
  title: string
  description?: string
  type: string
  properties: Record<string, any>
  required?: string[]
  ui?: any
}

interface ConfigFormEditorProps {
  configType: string
  title: string
  description: string
  configData: any
  onSave: (data: any) => Promise<void>
  hasChanges: boolean
  loading: boolean
}

export function ConfigFormEditor({
  configType,
  title,
  description,
  configData,
  onSave,
  hasChanges,
  loading
}: ConfigFormEditorProps) {
  const [schema, setSchema] = useState<FormSchema | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSchema()
  }, [configType])

  const fetchSchema = async () => {
    try {
      const response = await fetch(`/api/admin/schema?type=${configType}`)
      if (response.ok) {
        const data = await response.json()
        setSchema(data)
      }
    } catch (error) {
      console.error('Failed to fetch schema:', error)
    }
  }

  const handleSubmit = async (values: Record<string, any>) => {
    setSubmitting(true)
    try {
      await onSave(values)
      toast.success('配置保存成功')
    } catch (error) {
      console.error('Failed to save config:', error)
      toast.error('配置保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  const getButtonText = () => {
    if (!configData || Object.keys(configData).length === 0) {
      return '保存配置'
    }
    if (hasChanges) {
      return '更新配置'
    }
    return '保存配置'
  }

  const handlePreview = () => {
    setPreviewData(configData)
    setShowPreview(true)
  }

  if (!schema) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size={40} />
        <p className={styles.loadingText}>加载表单配置中...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{description}</p>
        </div>
        <div className={styles.actions}>
          <Button
            icon={<IconCode />}
            onClick={handlePreview}
          >
            查看JSON
          </Button>
          <Button
            type="primary"
            icon={<IconSave />}
            loading={submitting || loading}
            disabled={!hasChanges && Object.keys(configData).length > 0}
            onClick={() => {
              const formElement = document.querySelector('form')
              if (formElement) {
                formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
              }
            }}
          >
            {getButtonText()}
          </Button>
        </div>
      </div>

      <Card className={styles.formCard}>
        <DynamicForm
          schema={schema}
          initialValues={configData}
          onSubmit={handleSubmit}
          loading={submitting}
        />
      </Card>

      <Modal
        title="JSON预览"
        visible={showPreview}
        onCancel={() => setShowPreview(false)}
        footer={[
          <Button key="close" onClick={() => setShowPreview(false)}>
            关闭
          </Button>,
          <Button
            key="copy"
            type="primary"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(previewData, null, 2))
              toast.success('已复制到剪贴板')
            }}
          >
            复制
          </Button>
        ]}
        style={{ width: 800 }}
      >
        <pre className={styles.jsonPreview}>
          {JSON.stringify(previewData, null, 2)}
        </pre>
      </Modal>
    </div>
  )
}
