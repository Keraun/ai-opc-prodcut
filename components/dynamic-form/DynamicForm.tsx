"use client"

import React, { useState, useEffect } from "react"
import { Form, Input, Select, DatePicker, Upload, Button, Tag, Space, Message } from "@arco-design/web-react"
import { IconPlus, IconDelete } from "@arco-design/web-react/icon"
import styles from "./DynamicForm.module.css"

interface FormSchema {
  title: string
  description?: string
  type: string
  properties: Record<string, FieldSchema>
  required?: string[]
  ui?: FormUIConfig
}

interface FieldSchema {
  type: string
  title: string
  description?: string
  required?: boolean
  default?: any
  enum?: Array<{ value: string; label: string }>
  items?: { type: string }
  minLength?: number
  maxLength?: number
  pattern?: string
  format?: string
  ui?: FieldUIConfig
}

interface FieldUIConfig {
  widget?: string
  placeholder?: string
  width?: string
  rows?: number
  accept?: string
}

interface FormUIConfig {
  layout?: 'horizontal' | 'vertical'
  labelAlign?: 'left' | 'right'
  groups?: Array<{
    title: string
    fields: string[]
  }>
}

interface DynamicFormProps {
  schema: FormSchema
  initialValues?: Record<string, any>
  onSubmit: (values: Record<string, any>) => void
  onCancel?: () => void
  loading?: boolean
}

export function DynamicForm({
  schema,
  initialValues = {},
  onSubmit,
  onCancel,
  loading = false
}: DynamicFormProps) {
  const [form] = Form.useForm()
  const [tags, setTags] = useState<string[]>(initialValues.tags || [])

  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      form.setFieldsValue(initialValues)
      setTags(initialValues.tags || [])
    }
  }, [initialValues, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validate()
      const finalValues = {
        ...values,
        tags
      }
      onSubmit(finalValues)
    } catch (error) {
      Message.error('请检查表单填写是否正确')
    }
  }

  const renderField = (fieldName: string, fieldSchema: FieldSchema) => {
    const { ui = {} } = fieldSchema
    const widget = ui.widget || 'input'

    switch (widget) {
      case 'input':
        return (
          <Input
            placeholder={ui.placeholder}
            style={{ width: ui.width || '100%' }}
          />
        )

      case 'textarea':
        return (
          <Input.TextArea
            placeholder={ui.placeholder}
            rows={ui.rows || 4}
            style={{ width: ui.width || '100%' }}
          />
        )

      case 'select':
        return (
          <Select
            placeholder={ui.placeholder}
            style={{ width: ui.width || '100%' }}
          >
            {fieldSchema.enum?.map(item => (
              <Select.Option key={item.value} value={item.value}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        )

      case 'date':
        return (
          <DatePicker
            placeholder={ui.placeholder}
            style={{ width: ui.width || '100%' }}
            format="YYYY-MM-DD"
          />
        )

      case 'tags':
        return (
          <div className={styles.tagsContainer}>
            <div className={styles.tagsList}>
              {tags.map((tag, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => {
                    const newTags = tags.filter((_, i) => i !== index)
                    setTags(newTags)
                  }}
                  className={styles.tag}
                >
                  {tag}
                </Tag>
              ))}
            </div>
            <Input
              placeholder={ui.placeholder}
              onPressEnter={(e) => {
                const value = (e.target as HTMLInputElement).value.trim()
                if (value && !tags.includes(value)) {
                  setTags([...tags, value])
                  ;(e.target as HTMLInputElement).value = ''
                }
              }}
              style={{ width: '100%', marginTop: tags.length > 0 ? '8px' : '0' }}
            />
          </div>
        )

      case 'upload':
        return (
          <Upload
            action="/api/upload"
            accept={ui.accept || 'image/*'}
            multiple={false}
            showUploadList
            style={{ width: ui.width || '100%' }}
          >
            <Button>上传文件</Button>
          </Upload>
        )

      default:
        return (
          <Input
            placeholder={ui.placeholder}
            style={{ width: ui.width || '100%' }}
          />
        )
    }
  }

  const renderFields = () => {
    const { properties, required = [], ui: formUI = {} } = schema
    const groups = formUI.groups || []

    if (groups.length > 0) {
      return groups.map((group, groupIndex) => (
        <div key={groupIndex} className={styles.formGroup}>
          <h3 className={styles.groupTitle}>{group.title}</h3>
          <div className={styles.groupFields}>
            {group.fields.map(fieldName => {
              const fieldSchema = properties[fieldName]
              if (!fieldSchema) return null

              return (
                <Form.Item
                  key={fieldName}
                  label={fieldSchema.title}
                  field={fieldName}
                  rules={[
                    {
                      required: required.includes(fieldName),
                      message: `请输入${fieldSchema.title}`
                    }
                  ]}
                  extra={fieldSchema.description}
                  className={styles.formItem}
                >
                  {renderField(fieldName, fieldSchema)}
                </Form.Item>
              )
            })}
          </div>
        </div>
      ))
    }

    return Object.entries(properties).map(([fieldName, fieldSchema]) => (
      <Form.Item
        key={fieldName}
        label={fieldSchema.title}
        field={fieldName}
        rules={[
          {
            required: required.includes(fieldName),
            message: `请输入${fieldSchema.title}`
          }
        ]}
        extra={fieldSchema.description}
        className={styles.formItem}
      >
        {renderField(fieldName, fieldSchema)}
      </Form.Item>
    ))
  }

  return (
    <div className={styles.dynamicForm}>
      <Form
        form={form}
        layout={schema.ui?.layout || 'vertical'}
        labelAlign={schema.ui?.labelAlign || 'left'}
        autoComplete="off"
      >
        {renderFields()}
      </Form>

      <div className={styles.formActions}>
        {onCancel && (
          <Button onClick={onCancel} style={{ marginRight: '12px' }}>
            取消
          </Button>
        )}
        <Button
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          提交
        </Button>
      </div>
    </div>
  )
}
