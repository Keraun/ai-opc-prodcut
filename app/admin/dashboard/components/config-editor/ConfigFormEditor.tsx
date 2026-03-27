"use client"

import { useState, useEffect } from "react"
import { Button, Card, Modal, Message, Spin, Alert } from "@arco-design/web-react"
import { IconSave, IconEye, IconCode, IconRefresh, IconPlus } from "@arco-design/web-react/icon"
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
  const [tableFields, setTableFields] = useState<any[]>([])
  const [showFieldsModal, setShowFieldsModal] = useState(false)
  const [loadingFields, setLoadingFields] = useState(false)
  const [creatingTable, setCreatingTable] = useState(false)
  const [tableLink, setTableLink] = useState<string>('')

  const isFeishuConfig = configType === 'feishu-app'

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
    return '保存配置'
  }

  const handlePreview = () => {
    setPreviewData(configData)
    setShowPreview(true)
  }

  const handleFetchTableFields = async () => {
    if (!configData?.tableId) {
      toast.error('请先配置表格ID')
      return
    }

    setLoadingFields(true)
    try {
      const response = await fetch('/api/feishu/schema')
      const result = await response.json()
      
      if (result.success) {
        setTableFields(result.data)
        setShowFieldsModal(true)
        toast.success('获取表格字段成功')
      } else {
        toast.error(result.message || '获取表格字段失败')
      }
    } catch (error) {
      console.error('Failed to fetch table fields:', error)
      toast.error('获取表格字段失败')
    } finally {
      setLoadingFields(false)
    }
  }

  const handleCreateTable = async () => {
    if (!configData?.appId || !configData?.appSecret || !configData?.baseLink) {
      toast.error('请先配置App ID、App Secret和飞书多维表格链接')
      return
    }

    setCreatingTable(true)
    try {
      const response = await fetch('/api/feishu/create-table', {
        method: 'POST'
      })
      const result = await response.json()
      
      if (result.success) {
        toast.success('飞书数据表生成成功')
        setTableLink(result.data.tableLink)
        
        const updatedConfig = {
          ...configData,
          tableId: result.data.tableId,
          tableLink: result.data.tableLink
        }
        
        await onSave(updatedConfig)
      } else {
        toast.error(result.message || '生成飞书数据表失败')
      }
    } catch (error) {
      console.error('Failed to create table:', error)
      toast.error('生成飞书数据表失败')
    } finally {
      setCreatingTable(false)
    }
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
          {isFeishuConfig && (
            <>
              <Button
                icon={<IconRefresh />}
                loading={loadingFields}
                onClick={handleFetchTableFields}
              >
                查看表格字段
              </Button>
              <Button
                icon={<IconPlus />}
                loading={creatingTable}
                onClick={handleCreateTable}
              >
                生成数据表
              </Button>
            </>
          )}
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

      {isFeishuConfig && tableLink && (
        <Card className={styles.formCard} style={{ marginTop: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              飞书数据表链接
            </h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={tableLink}
                readOnly
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  backgroundColor: '#f9fafb',
                  fontSize: '14px',
                  color: '#374151'
                }}
              />
              <Button
                type="primary"
                onClick={() => {
                  navigator.clipboard.writeText(tableLink)
                  toast.success('链接已复制到剪贴板')
                }}
              >
                复制链接
              </Button>
              <Button
                onClick={() => {
                  window.open(tableLink, '_blank')
                }}
              >
                打开表格
              </Button>
            </div>
          </div>
        </Card>
      )}

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

      <Modal
        title="飞书表格字段"
        visible={showFieldsModal}
        onCancel={() => setShowFieldsModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowFieldsModal(false)}>
            关闭
          </Button>
        ]}
        style={{ width: 800 }}
      >
        {tableFields.length > 0 ? (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {tableFields.map((field: any) => (
              <div key={field.field_id} style={{ 
                padding: '12px', 
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {field.field_name}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  类型: {field.type}
                </div>
                {field.property && Object.keys(field.property).length > 0 && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    属性: {JSON.stringify(field.property)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Alert type="info" content="表格中没有字段" />
        )}
      </Modal>
    </div>
  )
}
