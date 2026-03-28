import React from "react"
import { Input, Select, DatePicker, Upload, Button, Tag, Switch, InputNumber, Radio, Checkbox } from "@arco-design/web-react"
import { Plus as IconPlus, Trash2 as IconTrash2 } from "lucide-react"
import type { FieldSchema } from "./useDynamicFormHook"
import { getDefaultWidget } from "./useDynamicFormHook"
import styles from "./DynamicForm.module.css"

export function renderField(
  fieldName: string,
  fieldSchema: FieldSchema,
  tags: Record<string, string[]>,
  addTag: (fieldName: string, value: string) => void,
  removeTag: (fieldName: string, index: number) => void
): React.ReactNode {
  const { ui = {} } = fieldSchema
  const widget = ui.widget || getDefaultWidget(fieldSchema)

  switch (widget) {
    case 'input':
      return (
        <Input
          placeholder={ui.placeholder}
          disabled={ui.readonly}
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
                onClose={() => removeTag(fieldName, index)}
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
              if (value) {
                addTag(fieldName, value)
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
          defaultChecked={fieldSchema.default}
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

export function renderArrayField(
  fieldName: string,
  fieldSchema: FieldSchema,
  arrayFields: Record<string, any[]>,
  addArrayItem: (fieldName: string, itemSchema?: FieldSchema) => void,
  removeArrayItem: (fieldName: string, index: number) => void,
  updateArrayItem: (fieldName: string, index: number, value: any) => void
): React.ReactNode {
  const items = arrayFields[fieldName] || []
  const itemSchema = fieldSchema.items as FieldSchema | undefined

  return (
    <div className={styles.arrayField}>
      {items.map((item, index) => (
        <div key={index} className={styles.arrayItem}>
          {itemSchema?.type === 'object' && itemSchema.properties ? (
            <div className={styles.arrayObjectItem}>
              {Object.entries(itemSchema.properties).map(([subKey, subField]) => (
                <div key={subKey} className={styles.arraySubField}>
                  <label className={styles.arraySubLabel}>
                    {(subField as FieldSchema).title}
                    {(subField as FieldSchema).required && <span className={styles.requiredMark}>*</span>}
                  </label>
                  <Input
                    placeholder={`输入 ${(subField as FieldSchema).title}`}
                    value={item[subKey]}
                    onChange={(value) => {
                      const newItem = { ...item, [subKey]: value }
                      updateArrayItem(fieldName, index, newItem)
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Input
              value={item}
              onChange={(value) => updateArrayItem(fieldName, index, value)}
              placeholder={`输入第 ${index + 1} 项`}
              style={{ flex: 1 }}
            />
          )}
          <Button
            icon={<IconTrash2 />}
            status="danger"
            onClick={() => removeArrayItem(fieldName, index)}
            className={styles.arrayItemDelete}
          />
        </div>
      ))}
      <Button
        icon={<IconPlus />}
        onClick={() => addArrayItem(fieldName, itemSchema)}
        long
        className={styles.arrayAddButton}
      >
        添加项目
      </Button>
    </div>
  )
}
