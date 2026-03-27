"use client"

import React, { useState, useEffect } from "react"
import { Form, Input, Select, DatePicker, Upload, Button, Tag, Space, Switch, InputNumber, Radio, Checkbox, Grid } from "@arco-design/web-react"
import { IconPlus, IconDelete } from "@arco-design/web-react/icon"
import { useMessage } from "@/app/components/custom-message"
import { extractTableId } from "@/lib/feishu-utils"
import styles from "./DynamicForm.module.css"

const { Row, Col } = Grid

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
  items?: FieldSchema | { type: string }
  properties?: Record<string, FieldSchema>
  minLength?: number
  maxLength?: number
  pattern?: string
  format?: string
  minimum?: number
  maximum?: number
  ui?: FieldUIConfig
}

interface FieldUIConfig {
  widget?: 'input' | 'textarea' | 'select' | 'date' | 'tags' | 'upload' | 'switch' | 'number' | 'radio' | 'checkbox' | 'color'
  placeholder?: string
  width?: string
  rows?: number
  accept?: string
  min?: number
  max?: number
  step?: number
  options?: Array<{ label: string; value: any }>
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

function parseWidth(width?: string): { span: number; offset?: number } {
  if (!width) return { span: 24 }
  
  if (width === '100%') return { span: 24 }
  if (width === '50%') return { span: 12 }
  if (width === '33%' || width === '33.33%') return { span: 8 }
  if (width === '25%') return { span: 6 }
  if (width === '66%' || width === '66.67%') return { span: 16 }
  if (width === '75%') return { span: 18 }
  
  const numWidth = parseInt(width)
  if (!isNaN(numWidth)) {
    if (numWidth >= 100) return { span: 24 }
    return { span: Math.round((numWidth / 100) * 24) }
  }
  
  return { span: 24 }
}

export function DynamicForm({
  schema,
  initialValues = {},
  onSubmit,
  onCancel,
  loading = false
}: DynamicFormProps) {
  const message = useMessage()
  const [form] = Form.useForm()
  const [tags, setTags] = useState<Record<string, string[]>>({})
  const [arrayFields, setArrayFields] = useState<Record<string, any[]>>({})

  useEffect(() => {
    form.setFieldsValue(initialValues)
    
    const initialTags: Record<string, string[]> = {}
    const initialArrays: Record<string, any[]> = {}
    
    Object.entries(schema.properties).forEach(([key, field]) => {
      if (field.ui?.widget === 'tags' && Array.isArray(initialValues[key])) {
        initialTags[key] = initialValues[key]
      }
      if (field.type === 'array' && !field.ui?.widget && Array.isArray(initialValues[key])) {
        initialArrays[key] = initialValues[key]
      }
    })
    
    setTags(initialTags)
    setArrayFields(initialArrays)
  }, [initialValues, form, schema])

  const handleSubmit = async () => {
    try {
      const values = await form.validate()
      
      // Process tableId field to extract from links
      const processedValues = {
        ...values
      }
      
      if ('tableId' in processedValues && processedValues.tableId) {
        processedValues.tableId = extractTableId(processedValues.tableId)
      }
      
      const finalValues = {
        ...processedValues,
        ...tags,
        ...arrayFields
      }
      
      onSubmit(finalValues)
    } catch (error) {
      message.error('请检查表单填写是否正确')
    }
  }

  const renderField = (fieldName: string, fieldSchema: FieldSchema) => {
    const { ui = {} } = fieldSchema
    const widget = ui.widget || getDefaultWidget(fieldSchema)

    switch (widget) {
      case 'input':
        return (
          <Input
            placeholder={ui.placeholder}
            style={{ width: '100%' }}
          />
        )

      case 'textarea':
        return (
          <Input.TextArea
            placeholder={ui.placeholder}
            rows={ui.rows || 4}
            style={{ width: '100%' }}
          />
        )

      case 'select':
        return (
          <Select
            placeholder={ui.placeholder}
            style={{ width: '100%' }}
          >
            {(ui.options || fieldSchema.enum || []).map(item => (
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
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
          />
        )

      case 'tags':
        return (
          <div className={styles.tagsContainer}>
            <div className={styles.tagsList}>
              {(tags[fieldName] || []).map((tag, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => {
                    const newTags = (tags[fieldName] || []).filter((_, i) => i !== index)
                    setTags({ ...tags, [fieldName]: newTags })
                  }}
                  className={styles.tag}
                >
                  {tag}
                </Tag>
              ))}
            </div>
            <Input
              placeholder={ui.placeholder || '输入后按回车添加'}
              onPressEnter={(e) => {
                const value = (e.target as HTMLInputElement).value.trim()
                if (value && !(tags[fieldName] || []).includes(value)) {
                  setTags({ 
                    ...tags, 
                    [fieldName]: [...(tags[fieldName] || []), value] 
                  })
                  ;(e.target as HTMLInputElement).value = ''
                }
              }}
              style={{ width: '100%', marginTop: (tags[fieldName] || []).length > 0 ? '8px' : '0' }}
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
            style={{ width: '100%' }}
          >
            <Button>上传文件</Button>
          </Upload>
        )

      case 'switch':
        return (
          <Switch
            defaultChecked={fieldSchema.default || initialValues[fieldName]}
          />
        )

      case 'number':
        return (
          <InputNumber
            placeholder={ui.placeholder}
            min={ui.min ?? fieldSchema.minimum}
            max={ui.max ?? fieldSchema.maximum}
            step={ui.step}
            style={{ width: '100%' }}
          />
        )

      case 'radio':
        return (
          <Radio.Group>
            {(ui.options || []).map(item => (
              <Radio key={item.value} value={item.value}>
                {item.label}
              </Radio>
            ))}
          </Radio.Group>
        )

      case 'checkbox':
        return (
          <Checkbox.Group>
            {(ui.options || []).map(item => (
              <Checkbox key={item.value} value={item.value}>
                {item.label}
              </Checkbox>
            ))}
          </Checkbox.Group>
        )

      case 'color':
        return (
          <Input
            type="color"
            placeholder={ui.placeholder}
            style={{ width: '100%', height: '40px' }}
          />
        )

      default:
        return (
          <Input
            placeholder={ui.placeholder}
            style={{ width: '100%' }}
          />
        )
    }
  }

  const getDefaultWidget = (fieldSchema: FieldSchema): string => {
    if (fieldSchema.ui?.widget) return fieldSchema.ui.widget
    
    switch (fieldSchema.type) {
      case 'string':
        if (fieldSchema.enum) return 'select'
        if (fieldSchema.format === 'date') return 'date'
        return 'input'
      case 'number':
      case 'integer':
        return 'number'
      case 'boolean':
        return 'switch'
      case 'array':
        if (fieldSchema.items && typeof fieldSchema.items === 'object' && 'type' in fieldSchema.items) {
          return 'tags'
        }
        return 'tags'
      default:
        return 'input'
    }
  }

  const renderArrayField = (fieldName: string, fieldSchema: FieldSchema) => {
    const items = arrayFields[fieldName] || []
    const itemSchema = fieldSchema.items as FieldSchema | undefined

    const addItem = () => {
      const newItem = itemSchema?.type === 'object' ? {} : ''
      setArrayFields({ ...arrayFields, [fieldName]: [...items, newItem] })
    }

    const removeItem = (index: number) => {
      const newItems = items.filter((_, i) => i !== index)
      setArrayFields({ ...arrayFields, [fieldName]: newItems })
    }

    const updateItem = (index: number, value: any) => {
      const newItems = [...items]
      newItems[index] = value
      setArrayFields({ ...arrayFields, [fieldName]: newItems })
    }

    return (
      <div className={styles.arrayField}>
        {items.map((item, index) => (
          <div key={index} className={styles.arrayItem}>
            {itemSchema?.type === 'object' && itemSchema.properties ? (
              <div className={styles.arrayObjectItem}>
                {Object.entries(itemSchema.properties).map(([subKey, subField]) => (
                  <div key={subKey} className={styles.arraySubField}>
                    <label className={styles.arraySubLabel}>
                      {subField.title}
                      {subField.required && <span className={styles.requiredMark}>*</span>}
                    </label>
                    {renderField(`${fieldName}.${index}.${subKey}`, subField as FieldSchema)}
                  </div>
                ))}
              </div>
            ) : (
              <Input
                value={item}
                onChange={(value) => updateItem(index, value)}
                placeholder={`输入第 ${index + 1} 项`}
                style={{ flex: 1 }}
              />
            )}
            <Button
              icon={<IconDelete />}
              status="danger"
              onClick={() => removeItem(index)}
              className={styles.arrayItemDelete}
            />
          </div>
        ))}
        <Button
          icon={<IconPlus />}
          onClick={addItem}
          long
          className={styles.arrayAddButton}
        >
          添加项目
        </Button>
      </div>
    )
  }

  const renderFields = () => {
    const { properties, required = [], ui: formUI = {} } = schema
    const groups = formUI.groups || []

    if (groups.length > 0) {
      return groups.map((group, groupIndex) => (
        <div key={groupIndex} className={styles.formGroup}>
          <h3 className={styles.groupTitle}>{group.title}</h3>
          <Row gutter={[16, 16]}>
            {group.fields.map(fieldName => {
              const fieldSchema = properties[fieldName]
              if (!fieldSchema) return null

              const fieldWidth = fieldSchema.ui?.width || '100%'
              const { span } = parseWidth(fieldWidth)
              const isRequired = required.includes(fieldName) || fieldSchema.required

              return (
                <Col key={fieldName} span={span}>
                  <Form.Item
                    label={
                      <span className={styles.fieldLabel}>
                        {fieldSchema.title}
                        {isRequired && <span className={styles.requiredMark}>*</span>}
                      </span>
                    }
                    field={fieldName}
                    rules={[
                      {
                        required: isRequired,
                        message: `请输入${fieldSchema.title}`
                      }
                    ]}
                    extra={fieldSchema.description}
                    className={styles.formItem}
                  >
                    {fieldSchema.type === 'array' && !fieldSchema.ui?.widget
                      ? renderArrayField(fieldName, fieldSchema)
                      : renderField(fieldName, fieldSchema)}
                  </Form.Item>
                </Col>
              )
            })}
          </Row>
        </div>
      ))
    }

    return (
      <Row gutter={[16, 16]}>
        {Object.entries(properties).map(([fieldName, fieldSchema]) => {
          const fieldWidth = fieldSchema.ui?.width || '100%'
          const { span } = parseWidth(fieldWidth)
          const isRequired = required.includes(fieldName) || fieldSchema.required

          return (
            <Col key={fieldName} span={span}>
              <Form.Item
                label={
                  <span className={styles.fieldLabel}>
                    {fieldSchema.title}
                    {isRequired && <span className={styles.requiredMark}>*</span>}
                  </span>
                }
                field={fieldName}
                rules={[
                  {
                    required: isRequired,
                    message: `请输入${fieldSchema.title}`
                  }
                ]}
                extra={fieldSchema.description}
                className={styles.formItem}
              >
                {fieldSchema.type === 'array' && !fieldSchema.ui?.widget
                  ? renderArrayField(fieldName, fieldSchema)
                  : renderField(fieldName, fieldSchema)}
              </Form.Item>
            </Col>
          )
        })}
      </Row>
    )
  }

  return (
    <div className={styles.dynamicForm}>
      <Form
        form={form}
        layout={schema.ui?.layout || 'vertical'}
        labelAlign={schema.ui?.labelAlign || 'left'}
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        {renderFields()}
      </Form>
    </div>
  )
}
