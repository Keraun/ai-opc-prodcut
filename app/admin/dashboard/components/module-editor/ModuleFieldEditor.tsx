"use client"

import { useState, useEffect } from "react"
import { Input, InputNumber, Switch, Select, Space, InputTag } from "@arco-design/web-react"
import { toast } from "sonner"
import styles from "../../dashboard.module.css"
import { getModuleSchema } from "@/lib/api-client"

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
  const columns = 3

  Object.entries(properties).forEach(([key, property]) => {
    const path = currentPath ? `${currentPath}.${key}` : key
    if (property.type !== "object") {
      items.push({
        key,
        property,
        colSpan: Math.min(property["x-col-span"] || 1, columns),
        path
      })
    }
  })

  return items
}

function groupFieldsByRow(items: FieldLayoutItem[]): FieldLayoutItem[][] {
  const rows: FieldLayoutItem[][] = []
  const columns = 3
  let currentRow: FieldLayoutItem[] = []
  let currentCol = 0

  items.forEach((item) => {
    const neededCols = item.colSpan
    
    if (currentCol + neededCols > columns) {
      if (currentRow.length > 0) {
        rows.push(currentRow)
      }
      currentRow = [item]
      currentCol = neededCols
    } else {
      currentRow.push(item)
      currentCol += neededCols
    }
  })

  if (currentRow.length > 0) {
    rows.push(currentRow)
  }

  return rows
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
    const { type, title, description, enum: enumValues, "x-component": component } = property
    const value = getNestedValue(data, path)

    const fieldStyle = {
      gridColumn: `span ${colSpan} / span ${colSpan}`
    }

    if (enumValues && enumValues.length > 0) {
      return (
        <div key={path} className={styles.formField} style={fieldStyle}>
          <label className={styles.formLabel}>{title}</label>
          {description && <span className={styles.formHint}>{description}</span>}
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
      )
    }

    if (component === "tags" || type === "array") {
      const arrayValue = Array.isArray(value) ? value : []
      return (
        <div key={path} className={styles.formField} style={fieldStyle}>
          <label className={styles.formLabel}>{title}</label>
          {description && <span className={styles.formHint}>{description}</span>}
          <InputTag
            value={arrayValue.map(String)}
            onChange={(vals) => handleFieldChange(path, vals)}
            placeholder="输入后按回车添加"
            style={{ width: "100%" }}
          />
        </div>
      )
    }

    switch (type) {
      case "string":
        return (
          <div key={path} className={styles.formField} style={fieldStyle}>
            <label className={styles.formLabel}>{title}</label>
            {description && <span className={styles.formHint}>{description}</span>}
            <Input
              value={value as string}
              onChange={(val) => handleFieldChange(path, val)}
              placeholder={`请输入${title}`}
            />
          </div>
        )

      case "number":
        return (
          <div key={path} className={styles.formField} style={fieldStyle}>
            <label className={styles.formLabel}>{title}</label>
            {description && <span className={styles.formHint}>{description}</span>}
            <InputNumber
              value={value as number}
              onChange={(val) => handleFieldChange(path, val)}
              style={{ width: "100%" }}
              placeholder={`请输入${title}`}
            />
          </div>
        )

      case "boolean":
        return (
          <div key={path} className={styles.formField} style={fieldStyle}>
            <div className={styles.formSwitchField}>
              <div>
                <label className={styles.formLabel}>{title}</label>
                {description && <span className={styles.formHint}>{description}</span>}
              </div>
              <Switch
                checked={value as boolean}
                onChange={(val) => handleFieldChange(path, val)}
              />
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
      {topLevelObjectFields.map(([key, property]) => renderObjectField(key, property))}
      
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
    </div>
  )
}
