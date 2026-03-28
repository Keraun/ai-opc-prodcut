import { useState, useEffect, useCallback } from "react"
import { Form } from "@arco-design/web-react"
import { toast } from "sonner"
import { extractTableId, extractAppToken } from "@/lib/feishu-utils"

export interface FormSchema {
  title: string
  description?: string
  type: string
  properties: Record<string, FieldSchema>
  required?: string[]
  ui?: FormUIConfig
}

export interface FieldSchema {
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

export interface FieldUIConfig {
  widget?: 'input' | 'textarea' | 'select' | 'date' | 'tags' | 'upload' | 'switch' | 'number' | 'radio' | 'checkbox' | 'color'
  placeholder?: string
  width?: string
  rows?: number
  accept?: string
  min?: number
  max?: number
  step?: number
  options?: Array<{ label: string; value: any }>
  readonly?: boolean
}

export interface FormUIConfig {
  layout?: 'horizontal' | 'vertical'
  labelAlign?: 'left' | 'right'
  groups?: Array<{
    title: string
    fields: string[]
  }>
}

export interface DynamicFormProps {
  schema: FormSchema
  initialValues?: Record<string, any>
  onSubmit: (values: Record<string, any>) => void
  onCancel?: () => void
  loading?: boolean
}

export function parseWidth(width?: string): { span: number; offset?: number } {
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

export function getDefaultWidget(fieldSchema: FieldSchema): string {
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

export function useDynamicForm(
  schema: FormSchema,
  initialValues: Record<string, any> = {},
  onSubmit: (values: Record<string, any>) => void
) {
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

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validate()

      const processedValues = { ...values }

      if ('tableId' in processedValues && processedValues.tableId) {
        processedValues.tableId = extractTableId(processedValues.tableId)
      }

      if ('baseLink' in processedValues && processedValues.baseLink) {
        processedValues.appToken = extractAppToken(processedValues.baseLink)
      }

      const finalValues = {
        ...processedValues,
        ...tags,
        ...arrayFields
      }

      onSubmit(finalValues)
    } catch (error) {
      toast.error('请检查表单填写是否正确')
    }
  }, [form, tags, arrayFields, onSubmit])

  const addTag = useCallback((fieldName: string, value: string) => {
    if (value && !(tags[fieldName] || []).includes(value)) {
      setTags({
        ...tags,
        [fieldName]: [...(tags[fieldName] || []), value]
      })
    }
  }, [tags])

  const removeTag = useCallback((fieldName: string, index: number) => {
    const newTags = (tags[fieldName] || []).filter((_, i) => i !== index)
    setTags({ ...tags, [fieldName]: newTags })
  }, [tags])

  const addArrayItem = useCallback((fieldName: string, itemSchema?: FieldSchema) => {
    const items = arrayFields[fieldName] || []
    const newItem = itemSchema?.type === 'object' ? {} : ''
    setArrayFields({ ...arrayFields, [fieldName]: [...items, newItem] })
  }, [arrayFields])

  const removeArrayItem = useCallback((fieldName: string, index: number) => {
    const items = arrayFields[fieldName] || []
    const newItems = items.filter((_, i) => i !== index)
    setArrayFields({ ...arrayFields, [fieldName]: newItems })
  }, [arrayFields])

  const updateArrayItem = useCallback((fieldName: string, index: number, value: any) => {
    const items = arrayFields[fieldName] || []
    const newItems = [...items]
    newItems[index] = value
    setArrayFields({ ...arrayFields, [fieldName]: newItems })
  }, [arrayFields])

  return {
    form,
    tags,
    arrayFields,
    handleSubmit,
    addTag,
    removeTag,
    addArrayItem,
    removeArrayItem,
    updateArrayItem
  }
}
