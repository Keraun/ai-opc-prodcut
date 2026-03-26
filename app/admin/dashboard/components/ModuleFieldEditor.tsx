"use client"

import { useState, useEffect } from "react"
import { Input, InputNumber, Switch, Select, Space, Message } from "@arco-design/web-react"
import styles from "../dashboard.module.css"

interface SchemaProperty {
  type: string
  title: string
  description?: string
  enum?: string[]
  properties?: Record<string, SchemaProperty>
  items?: SchemaProperty
  default?: any
}

interface ModuleFieldEditorProps {
  moduleId: string
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}

export function ModuleFieldEditor({ moduleId, data, onChange }: ModuleFieldEditorProps) {
  const [schema, setSchema] = useState<Record<string, SchemaProperty>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchema()
  }, [moduleId])

  const fetchSchema = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/modules/${moduleId}/schema`)
      if (response.ok) {
        const schemaData = await response.json()
        setSchema(schemaData.properties || {})
      }
    } catch (error) {
      Message.error("获取模块字段定义失败")
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (fieldKey: string, value: unknown) => {
    onChange({
      ...data,
      [fieldKey]: value,
    })
  }

  const renderField = (key: string, property: SchemaProperty, value: unknown): React.ReactNode => {
    const { type, title, description, enum: enumValues, properties: nestedProperties, items } = property

    if (type === "object" && nestedProperties) {
      return (
        <div key={key} className={styles.fieldGroup}>
          <div className={styles.fieldGroupTitle}>
            <h4 style={{ margin: 0 }}>{title}</h4>
            {description && <p style={{ margin: "4px 0", fontSize: 12, color: "#6b7280" }}>{description}</p>}
          </div>
          <div className={styles.fieldGroupContent}>
            {Object.entries(nestedProperties).map(([nestedKey, nestedProp]) =>
              renderField(
                `${key}.${nestedKey}`,
                nestedProp,
                (value as Record<string, unknown>)?.[nestedKey]
              )
            )}
          </div>
        </div>
      )
    }

    if (type === "array") {
      const arrayValue = Array.isArray(value) ? value : []
      return (
        <div key={key} className={styles.fieldItem}>
          <label className={styles.fieldLabel}>{title}</label>
          {description && <p className={styles.fieldDescription}>{description}</p>}
          <div className={styles.arrayField}>
            {arrayValue.map((item, index) => (
              <div key={index} className={styles.arrayItem}>
                {items?.type === "string" && (
                  <Input
                    value={item as string}
                    onChange={(val) => {
                      const newArray = [...arrayValue]
                      newArray[index] = val
                      handleFieldChange(key, newArray)
                    }}
                    placeholder={`项目 ${index + 1}`}
                  />
                )}
                <button
                  className={styles.arrayItemDelete}
                  onClick={() => {
                    const newArray = arrayValue.filter((_, i) => i !== index)
                    handleFieldChange(key, newArray)
                  }}
                >
                  删除
                </button>
              </div>
            ))}
            <button
              className={styles.arrayAddButton}
              onClick={() => {
                const newArray = [...arrayValue, items?.type === "string" ? "" : {}]
                handleFieldChange(key, newArray)
              }}
            >
              + 添加项目
            </button>
          </div>
        </div>
      )
    }

    if (enumValues && enumValues.length > 0) {
      return (
        <div key={key} className={styles.fieldItem}>
          <label className={styles.fieldLabel}>{title}</label>
          {description && <p className={styles.fieldDescription}>{description}</p>}
          <Select
            value={value as string}
            onChange={(val) => handleFieldChange(key, val)}
            style={{ width: "100%" }}
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

    switch (type) {
      case "string":
        return (
          <div key={key} className={styles.fieldItem}>
            <label className={styles.fieldLabel}>{title}</label>
            {description && <p className={styles.fieldDescription}>{description}</p>}
            <Input
              value={value as string}
              onChange={(val) => handleFieldChange(key, val)}
              placeholder={`请输入${title}`}
            />
          </div>
        )

      case "number":
        return (
          <div key={key} className={styles.fieldItem}>
            <label className={styles.fieldLabel}>{title}</label>
            {description && <p className={styles.fieldDescription}>{description}</p>}
            <InputNumber
              value={value as number}
              onChange={(val) => handleFieldChange(key, val)}
              style={{ width: "100%" }}
            />
          </div>
        )

      case "boolean":
        return (
          <div key={key} className={styles.fieldItem}>
            <label className={styles.fieldLabel}>{title}</label>
            {description && <p className={styles.fieldDescription}>{description}</p>}
            <Switch
              checked={value as boolean}
              onChange={(val) => handleFieldChange(key, val)}
            />
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return <div className={styles.loading}>加载字段定义...</div>
  }

  if (Object.keys(schema).length === 0) {
    return (
      <div style={{ textAlign: "center", color: "#9ca3af", padding: 20 }}>
        该模块没有可编辑的字段
      </div>
    )
  }

  return (
    <div className={styles.moduleFieldEditor}>
      {Object.entries(schema).map(([key, property]) =>
        renderField(key, property, data[key])
      )}
    </div>
  )
}
