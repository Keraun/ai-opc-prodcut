"use client"

import { useState, useEffect } from "react"
import { Button, Card, Modal, Message, Spin, Alert } from "@arco-design/web-react"
import { IconSave, IconEye, IconCode, IconRefresh, IconPlus } from "@arco-design/web-react/icon"
import { toast } from "sonner"
import { DynamicForm } from "@/components/dynamic-form"
import { getSchema } from "@/lib/api-client"
import { ManagementHeader } from "../ManagementHeader"
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

  const isNotificationConfig = configType === 'notification'

  useEffect(() => {
    fetchSchema()
  }, [configType])

  const fetchSchema = async () => {
    try {
      const schemaData = await getSchema(configType)
      setSchema(schemaData as unknown as FormSchema)
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

  const renderActions = () => (
    <>
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
    </>
  )

  const templateOptions = [
    {
      name: '默认模板',
      content: '【新留言通知】\n\n用户信息：\n姓名：{name}\n电话：{phone || \'\'}\n微信：{wechat || \'\'}\n邮箱：{email || \'\'}\n\n留言内容：\n{message}\n\n设备信息：\nIP地址：{ip}\n地区：{region || \'\'}\n操作系统：{os} {osVersion}\n浏览器：{browser} {browserVersion}\n设备机型：{deviceModel}\n\n提交时间：{created_at}\n\n请及时处理！'
    },
    {
      name: '简洁模板',
      content: '【新留言】\n\n姓名：{name}\n电话：{phone || \'\'}\n内容：{message}\n\n提交时间：{created_at}'
    },
    {
      name: '详细模板',
      content: '【重要通知】新留言提醒\n\n尊敬的管理员：\n\n您收到了一条新的用户留言，详情如下：\n\n用户信息\n姓名：{name}\n联系电话：{phone || \'未提供\'}\n微信：{wechat || \'未提供\'}\n邮箱：{email || \'未提供\'}\n\n留言内容\n{message}\n\n设备信息\nIP地址：{ip}\n地区：{region || \'未知\'}\n操作系统：{os} {osVersion}\n浏览器：{browser} {browserVersion}\n设备：{deviceModel}\n\n提交时间：{created_at}\n\n请及时登录管理后台处理此留言。\n\n系统自动发送，请勿回复。'
    }
  ]

  const handleSelectTemplate = (content: string) => {
    const updatedConfig = {
      ...configData,
      notificationTemplate: content
    }
    onSave(updatedConfig)
  }

  return (
    <div className={styles.container}>
      <ManagementHeader
        title={title}
        description={description}
        actions={renderActions()}
      />

      <Card className={styles.formCard}>
        {!schema ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Spin size={40} />
            <div style={{ marginTop: '16px', color: '#999' }}>加载表单配置中...</div>
          </div>
        ) : (
          <>
            <DynamicForm
              key={configType + JSON.stringify(configData)}
              schema={schema}
              initialValues={configData}
              onSubmit={handleSubmit}
              loading={submitting}
            />
            {isNotificationConfig && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                <h4 style={{ marginBottom: '12px' }}>模板选择</h4>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {templateOptions.map((template, index) => (
                    <Button
                      key={index}
                      onClick={() => handleSelectTemplate(template.content)}
                      style={{ flex: '1 1 calc(33.333% - 8px)', minWidth: '200px' }}
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
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
