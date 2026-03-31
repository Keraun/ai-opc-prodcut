import React from "react"
import { Input, Select, DatePicker, Upload, Button, Tag, Switch, InputNumber, Radio, Checkbox } from "@arco-design/web-react"
import { Plus as IconPlus, Trash2 as IconTrash2 } from "lucide-react"
import type { FieldSchema } from "./useDynamicFormHook"
import { getDefaultWidget } from "./useDynamicFormHook"
import { ImageUploadInput } from "./ImageUploadInput"
import { RichTextEditor } from "@/components/RichTextEditor"
import styles from "./DynamicForm.module.css"

export function renderField(
  fieldName: string,
  fieldSchema: FieldSchema,
  tags: Record<string, string[]>,
  addTag: (fieldName: string, value: string) => void,
  removeTag: (fieldName: string, index: number) => void,
  value?: any,
  onChange?: (value: any) => void
): React.ReactNode {
  const { ui = {} } = fieldSchema
  
  let widget = ui.widget || getDefaultWidget(fieldSchema)
  
  if (fieldSchema['x-component'] === 'tags' && fieldSchema.type === 'array') {
    widget = 'tags'
  }

  switch (widget) {
    case 'input':
      return (
        <Input
          placeholder={ui.placeholder}
          disabled={ui.readonly}
          allowClear
          style={{ width: '100%' }}
        />
      )

    case 'textarea':
      return (
        <Input.TextArea
          placeholder={ui.placeholder}
          rows={ui.rows || 10}
          allowClear
          style={{ width: '100%', minHeight: '400px' }}
        />
      )

    case 'richText':
    case 'richtext':
      return (
        <RichTextEditor
          placeholder={ui.placeholder}
        />
      )

    case 'select':
      return (
        <Select
          placeholder={ui.placeholder}
          allowClear
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
          allowClear
          style={{ width: '100%', height: '40px' }}
        />
      )

    case 'image':
      return (
        <ImageUploadInput
          placeholder={ui.placeholder || '请输入图片链接或点击上传'}
        />
      )

    default:
      return (
        <Input
          placeholder={ui.placeholder}
          allowClear
          style={{ width: '100%' }}
        />
      )
  }
}

function renderArraySubField(
  subField: FieldSchema,
  value: any,
  onChange: (value: any) => void
): React.ReactNode {
  const { ui = {} } = subField
  const widget = ui.widget || getDefaultWidget(subField)

  switch (widget) {
    case 'input':
      return (
        <Input
          placeholder={ui.placeholder || `输入 ${subField.title}`}
          value={value || ''}
          onChange={onChange}
          disabled={ui.readonly}
          allowClear
          style={{ width: '100%' }}
        />
      )

    case 'textarea':
      return (
        <Input.TextArea
          placeholder={ui.placeholder || `输入 ${subField.title}`}
          value={value || ''}
          onChange={onChange}
          rows={ui.rows || 4}
          allowClear
          style={{ width: '100%' }}
        />
      )

    case 'select':
      return (
        <Select
          placeholder={ui.placeholder || `选择 ${subField.title}`}
          value={value}
          onChange={onChange}
          allowClear
          style={{ width: '100%' }}
        >
          {(ui.options || subField.enum || []).map(item => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      )

    case 'date':
      return (
        <DatePicker
          placeholder={ui.placeholder || `选择 ${subField.title}`}
          value={value}
          onChange={onChange}
          style={{ width: '100%' }}
          format="YYYY-MM-DD"
        />
      )

    case 'number':
      return (
        <InputNumber
          placeholder={ui.placeholder || `输入 ${subField.title}`}
          value={value}
          onChange={onChange}
          min={ui.min ?? subField.minimum}
          max={ui.max ?? subField.maximum}
          step={ui.step}
          style={{ width: '100%' }}
        />
      )

    case 'switch':
      return (
        <Switch
          checked={value || subField.default}
          onChange={onChange}
        />
      )

    case 'color':
      return (
        <Input
          type="color"
          placeholder={ui.placeholder}
          value={value || ''}
          onChange={onChange}
          allowClear
          style={{ width: '100%', height: '40px' }}
        />
      )

    case 'image':
      return (
        <ImageUploadInput
          value={value || ''}
          onChange={onChange}
          placeholder={ui.placeholder || '请输入图片链接或点击上传'}
        />
      )

    default:
      return (
        <Input
          placeholder={ui.placeholder || `输入 ${subField.title}`}
          value={value || ''}
          onChange={onChange}
          allowClear
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
                  {renderArraySubField(
                    subField as FieldSchema,
                    item?.[subKey],
                    (value) => {
                      const newItem = { ...item, [subKey]: value }
                      updateArrayItem(fieldName, index, newItem)
                    }
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Input
              value={typeof item === 'string' ? item : ''}
              onChange={(value) => updateArrayItem(fieldName, index, value)}
              placeholder={`输入第 ${index + 1} 项`}
              allowClear
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
