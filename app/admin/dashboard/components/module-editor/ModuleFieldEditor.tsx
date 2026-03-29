"use client"

import { useState, useEffect, useRef } from "react"
import { Input, InputNumber, Switch, Select, InputTag, Table, Button, Space, Popconfirm, Input as AInput, Spin } from "@arco-design/web-react"
import { IconPlus, IconDelete, IconUpload, IconImage } from "@arco-design/web-react/icon"
import { toast } from "sonner"
import styles from "../../dashboard.module.css"
import { getModuleSchema } from "@/lib/api-client"
import { uploadImage } from "@/lib/api/images"

interface SchemaProperty {
  type: string
  title: string
  description?: string
  enum?: string[]
  properties?: Record<string, SchemaProperty>
  items?: SchemaProperty
  default?: any
  "x-col-span"?: number
  "x-component"?: string
  ui?: {
    widget?: string
    placeholder?: string
  }
}

interface ModuleFieldEditorProps {
  moduleId: string
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const result = { ...obj }
  const keys = path.split('.')
  let current = result

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }

  current[keys[keys.length - 1]] = value
  return result
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (typeof current !== 'object' || current === null) {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }

  return current
}

interface FieldLayoutItem {
  key: string
  property: SchemaProperty
  colSpan: number
  path: string
}

function calculateFieldLayout(
  properties: Record<string, SchemaProperty>,
  currentPath: string = ''
): FieldLayoutItem[] {
  const items: FieldLayoutItem[] = []
  const columns = 1

  Object.entries(properties).forEach(([key, property]) => {
    const path = currentPath ? `${currentPath}.${key}` : key
    if (property.type !== "object") {
      items.push({
        key,
        property,
        colSpan: 1,
        path
      })
    }
  })

  return items
}

function groupFieldsByRow(items: FieldLayoutItem[]): FieldLayoutItem[][] {
  const rows: FieldLayoutItem[][] = []
  items.forEach((item) => {
    rows.push([item])
  })
  return rows
}

function getDefaultItemForArray(itemSchema: SchemaProperty): Record<string, unknown> | string | number | boolean {
  const result: Record<string, unknown> = {}

  if (itemSchema.type === "object" && itemSchema.properties) {
    Object.entries(itemSchema.properties).forEach(([key, prop]) => {
      result[key] = prop.default ?? (prop.type === "string" ? "" : prop.type === "number" ? 0 : prop.type === "boolean" ? false : prop.type === "array" ? [] : null)
    })
  } else if (itemSchema.type === "string") {
    return ""
  } else if (itemSchema.type === "number") {
    return 0
  } else if (itemSchema.type === "boolean") {
    return false
  }

  return result
}

function TableImageUploadField({
  value,
  onChange,
  placeholder
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("图片大小不能超过10MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件")
      return
    }

    try {
      setUploading(true)
      const result = await uploadImage(file, { quality: 80 })

      if (result.success && result.url) {
        const fullUrl = getFullImageUrl(result.url)
        onChange(fullUrl)
        toast.success(`图片上传成功${result.savedPercentage ? `，节省 ${result.savedPercentage}% 空间` : ""}`)
      } else {
        toast.error(result.message || "上传失败")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("上传失败")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Input
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder || "请输入图片链接或点击上传"}
        disabled={uploading}
        style={{ flex: 1 }}
        prefix={<IconImage style={{ color: "#9ca3af" }} />}
      />
      <Button
        type="primary"
        size="small"
        onClick={handleUploadClick}
        disabled={uploading}
        loading={uploading}
        icon={<IconUpload />}
      >
        上传
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  )
}

function renderTableFieldCell(
  value: unknown,
  schema: SchemaProperty,
  onChange: (newValue: unknown) => void
): React.ReactNode {
  // 处理图片上传字段
  if (schema.ui?.widget === "image") {
    return (
      <TableImageUploadField
        value={value as string}
        onChange={onChange}
        placeholder={schema.ui?.placeholder}
      />
    )
  }

  switch (schema.type) {
    case "string":
      if (schema.enum && schema.enum.length > 0) {
        return (
          <Select
            value={value as string}
            onChange={onChange}
            style={{ width: "100%" }}
          >
            {schema.enum.map((v) => (
              <Select.Option key={v} value={v}>{v}</Select.Option>
            ))}
          </Select>
        )
      }
      return (
        <Input
          value={value as string}
          onChange={onChange}
        />
      )
    case "number":
      return (
        <InputNumber
          value={value as number}
          onChange={onChange}
          style={{ width: "100%" }}
        />
      )
    case "boolean":
      return (
        <Switch
          checked={value as boolean}
          onChange={onChange}
        />
      )
    default:
      return <span>{String(value)}</span>
  }
}

function renderTableField(
  item: FieldLayoutItem,
  data: Record<string, unknown>,
  onChange: (data: Record<string, unknown>) => void
): React.ReactNode {
  const { property, path, colSpan } = item
  const { title, description, items } = property
  const value = getNestedValue(data, path)
  const listValue = Array.isArray(value) ? value : []

  const fieldStyle = {
    gridColumn: `span ${colSpan} / span ${colSpan}`
  }

  const itemSchema: SchemaProperty = items || { type: "string", title: "" }

  let columns: any[] = []

  if (itemSchema.type === "object" && itemSchema.properties) {
    columns = Object.entries(itemSchema.properties).map(([key, prop]: [string, SchemaProperty]) => ({
      title: prop.title || key,
      dataIndex: key,
      render: (_: unknown, record: any, index: number) => {
        const cellValue = record[key]
        return renderTableFieldCell(
          cellValue,
          prop,
          (newVal) => {
            const newList = [...listValue]
            newList[index] = { ...newList[index], [key]: newVal }
            const newData = setNestedValue(data, path, newList)
            onChange(newData)
          }
        )
      }
    }))
  } else {
    columns = [
      {
        title: title,
        dataIndex: 'value',
        render: (_: unknown, record: any, index: number) => {
          return renderTableFieldCell(
            record.value,
            itemSchema,
            (newVal) => {
              const newList = [...listValue]
              newList[index] = { value: newVal }
              const newData = setNestedValue(data, path, newList)
              onChange(newData)
            }
          )
        }
      }
    ]
  }

  columns.push({
    title: '操作',
    dataIndex: 'actions',
    width: 100,
    render: (_: unknown, __: any, index: number) => (
      <Popconfirm
        title="确定要删除这一项吗？"
        onOk={() => {
          const newList = listValue.filter((_, i) => i !== index)
          const newData = setNestedValue(data, path, newList)
          onChange(newData)
        }}
      >
        <Button type="text" status="danger" size="small" icon={<IconDelete />}>
          删除
        </Button>
      </Popconfirm>
    )
  })

  const tableData = listValue.map((item, index) => {
    if (itemSchema.type === "object" && itemSchema.properties) {
      return { key: index, ...(item as Record<string, unknown>) }
    }
    return { key: index, value: item }
  })

  return (
    <div key={path} className={styles.formField} style={fieldStyle}>
      <div className={`${styles.formFieldRow} ${styles.formTableFieldRow}`}>
        <div className={styles.formFieldLabel}>
          <label className={styles.formLabel}>{title}</label>
          {description && <span className={styles.formHint}>{description}</span>}
        </div>
        <div className={styles.formFieldControl}>
          <Button
            type="primary"
            size="small"
            icon={<IconPlus />}
            onClick={() => {
              const newItem = getDefaultItemForArray(itemSchema)
              const newList = [...listValue, newItem]
              const newData = setNestedValue(data, path, newList)
              onChange(newData)
            }}
          >
            添加
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        data={tableData}
        pagination={false}
        size="small"
        border
        stripe
      />
    </div>
  )
}

function getFullImageUrl(url: string): string {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  // 相对路径，添加域名前缀
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`
}

function ImageUploadField({
  value,
  onChange,
  placeholder,
  title
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  title?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("图片大小不能超过10MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件")
      return
    }

    try {
      setUploading(true)
      const result = await uploadImage(file, { quality: 80 })

      if (result.success && result.url) {
        // 存储完整 URL
        const fullUrl = getFullImageUrl(result.url)
        onChange(fullUrl)
        toast.success(`图片上传成功${result.savedPercentage ? `，节省 ${result.savedPercentage}% 空间` : ""}`)
      } else {
        toast.error(result.message || "上传失败")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("上传失败")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // 获取用于预览的完整 URL
  const previewUrl = getFullImageUrl(value)

  return (
    <div className={styles.imageUploadField}>
      <div className={styles.imageUploadInputWrapper}>
        <Input
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder || `请输入${title || "图片链接"}或点击上传`}
          disabled={uploading}
          className={styles.imageUploadInput}
          prefix={<IconImage className={styles.imageUploadIcon} />}
        />
        <Button
          type="primary"
          onClick={handleUploadClick}
          disabled={uploading}
          loading={uploading}
          className={styles.imageUploadButton}
          icon={<IconUpload />}
        >
          上传图片
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {value && (
        <div className={styles.imagePreviewContainer}>
          <div className={styles.imagePreviewHeader}>
            <span className={styles.imagePreviewLabel}>图片预览</span>
            <button
              type="button"
              className={styles.imagePreviewToggle}
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "隐藏" : "显示"}
            </button>
          </div>
          {showPreview && (
            <div className={styles.imagePreviewWrapper}>
              <img
                src={previewUrl}
                alt="预览"
                className={styles.imagePreview}
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
                onLoad={(e) => {
                  e.currentTarget.style.display = "block"
                }}
              />
            </div>
          )}
        </div>
      )}

      {uploading && (
        <div className={styles.imageUploadingOverlay}>
          <Spin size={20} />
          <span>上传中...</span>
        </div>
      )}
    </div>
  )
}

export function ModuleFieldEditor({ moduleId, data, onChange }: ModuleFieldEditorProps) {
  const [schema, setSchema] = useState<Record<string, SchemaProperty>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSchema()
  }, [moduleId])

  const loadSchema = async () => {
    setLoading(true)
    const schemaData = await getModuleSchema(moduleId)
    if (schemaData && typeof schemaData === 'object' && 'properties' in schemaData) {
      setSchema((schemaData as any).properties || {})
    } else {
      toast.error("获取模块字段定义失败")
    }
    setLoading(false)
  }

  const handleFieldChange = (fieldKey: string, value: unknown) => {
    const newData = setNestedValue(data, fieldKey, value)
    onChange(newData)
  }

  const renderSimpleField = (item: FieldLayoutItem): React.ReactNode => {
    const { property, path, colSpan } = item
    const { type, title, description, enum: enumValues, "x-component": component, ui } = property
    const value = getNestedValue(data, path)

    const fieldStyle = {
      gridColumn: `span ${colSpan} / span ${colSpan}`
    }

    // 处理图片上传字段
    if (ui?.widget === "image") {
      return (
        <div key={path} className={styles.formField} style={fieldStyle}>
          <div className={styles.formFieldRow}>
            <div className={styles.formFieldLabel}>
              <label className={styles.formLabel}>{title}</label>
              {description && <span className={styles.formHint}>{description}</span>}
            </div>
            <div className={styles.formFieldControl}>
              <ImageUploadField
                value={value as string}
                onChange={(val) => handleFieldChange(path, val)}
                placeholder={ui.placeholder}
                title={title}
              />
            </div>
          </div>
        </div>
      )
    }

    if (type === "array" && property.items) {
      return renderTableField(item, data, onChange)
    }

    if (enumValues && enumValues.length > 0) {
      return (
        <div key={path} className={styles.formField} style={fieldStyle}>
          <div className={styles.formFieldRow}>
            <div className={styles.formFieldLabel}>
              <label className={styles.formLabel}>{title}</label>
              {description && <span className={styles.formHint}>{description}</span>}
            </div>
            <div className={styles.formFieldControl}>
              <Select
                value={value as string}
                onChange={(val) => handleFieldChange(path, val)}
                style={{ width: "100%" }}
                placeholder={`请选择${title}`}
              >
                {enumValues.map((enumValue) => (
                  <Select.Option key={enumValue} value={enumValue}>
                    {enumValue}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      )
    }

    if (component === "tags" || (type === "array" && !property.items)) {
      const arrayValue = Array.isArray(value) ? value : []
      return (
        <div key={path} className={styles.formField} style={fieldStyle}>
          <div className={styles.formFieldRow}>
            <div className={styles.formFieldLabel}>
              <label className={styles.formLabel}>{title}</label>
              {description && <span className={styles.formHint}>{description}</span>}
            </div>
            <div className={styles.formFieldControl}>
              <InputTag
                value={arrayValue.map(String)}
                onChange={(vals) => handleFieldChange(path, vals)}
                placeholder="输入后按回车添加"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>
      )
    }

    switch (type) {
      case "string":
        return (
          <div key={path} className={styles.formField} style={fieldStyle}>
            <div className={styles.formFieldRow}>
              <div className={styles.formFieldLabel}>
                <label className={styles.formLabel}>{title}</label>
                {description && <span className={styles.formHint}>{description}</span>}
              </div>
              <div className={styles.formFieldControl}>
                <Input
                  value={value as string}
                  onChange={(val) => handleFieldChange(path, val)}
                  placeholder={`请输入${title}`}
                />
              </div>
            </div>
          </div>
        )

      case "number":
        return (
          <div key={path} className={styles.formField} style={fieldStyle}>
            <div className={styles.formFieldRow}>
              <div className={styles.formFieldLabel}>
                <label className={styles.formLabel}>{title}</label>
                {description && <span className={styles.formHint}>{description}</span>}
              </div>
              <div className={styles.formFieldControl}>
                <InputNumber
                  value={value as number}
                  onChange={(val) => handleFieldChange(path, val)}
                  style={{ width: "100%" }}
                  placeholder={`请输入${title}`}
                />
              </div>
            </div>
          </div>
        )

      case "boolean":
        return (
          <div key={path} className={styles.formField} style={fieldStyle}>
            <div className={styles.formFieldRow}>
              <div className={styles.formFieldLabel}>
                <label className={styles.formLabel}>{title}</label>
                {description && <span className={styles.formHint}>{description}</span>}
              </div>
              <div className={styles.formFieldControl}>
                <Switch
                  checked={value as boolean}
                  onChange={(val) => handleFieldChange(path, val)}
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderObjectField = (key: string, property: SchemaProperty, currentPath: string = ''): React.ReactNode => {
    const { title, description, properties: nestedProperties } = property
    const fieldPath = currentPath ? `${currentPath}.${key}` : key

    if (!nestedProperties) return null

    const layoutItems = calculateFieldLayout(nestedProperties, fieldPath)
    const rows = groupFieldsByRow(layoutItems)

    return (
      <div key={fieldPath} className={styles.formSection}>
        <div className={styles.formSectionHeader}>
          <h4 className={styles.formSectionTitle}>{title}</h4>
          {description && <p className={styles.formSectionDesc}>{description}</p>}
        </div>
        <div className={styles.formGrid}>
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.formRow}>
              {row.map((item) => renderSimpleField(item))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className={styles.loading}>加载字段定义...</div>
  }

  if (Object.keys(schema).length === 0) {
    return (
      <div className={styles.emptyForm}>
        <div className={styles.emptyFormIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p>该模块没有可编辑的字段</p>
      </div>
    )
  }

  const topLevelObjectFields = Object.entries(schema).filter(([_, prop]) => prop.type === "object" && prop.properties)
  const topLevelSimpleFields = Object.entries(schema).filter(([_, prop]) => prop.type !== "object")

  return (
    <div className={styles.formEditor}>
      {topLevelSimpleFields.length > 0 && (
        <div className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <h4 className={styles.formSectionTitle}>基本设置</h4>
          </div>
          <div className={styles.formGrid}>
            {groupFieldsByRow(calculateFieldLayout(Object.fromEntries(topLevelSimpleFields))).map((row, rowIndex) => (
              <div key={rowIndex} className={styles.formRow}>
                {row.map((item) => renderSimpleField(item))}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {topLevelObjectFields.map(([key, property]) => renderObjectField(key, property))}
    </div>
  )
}
