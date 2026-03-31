"use client"

import React from "react"
import { Form, Grid } from "@arco-design/web-react"
import { useDynamicForm, parseWidth } from "./useDynamicFormHook"
import { renderField, renderArrayField } from "./formFieldRenderers"
import type { FormSchema, FieldSchema, DynamicFormProps } from "./useDynamicFormHook"
import styles from "./DynamicForm.module.css"

const { Row, Col } = Grid

export function DynamicForm({
  schema,
  initialValues = {},
  onSubmit,
  onCancel,
  loading = false
}: DynamicFormProps) {
  const {
    form,
    tags,
    arrayFields,
    handleSubmit,
    addTag,
    removeTag,
    addArrayItem,
    removeArrayItem,
    updateArrayItem
  } = useDynamicForm(schema, initialValues, onSubmit)

  const renderFieldComponent = (fieldName: string, fieldSchema: FieldSchema) => {
    return renderField(fieldName, fieldSchema, tags, addTag, removeTag, form.getFieldValue(fieldName), (value) => form.setFieldValue(fieldName, value))
  }

  const renderArrayFieldComponent = (fieldName: string, fieldSchema: FieldSchema) => {
    return renderArrayField(
      fieldName,
      fieldSchema,
      arrayFields,
      addArrayItem,
      removeArrayItem,
      updateArrayItem
    )
  }

  const renderObjectField = (fieldName: string, fieldSchema: FieldSchema) => {
    if (fieldSchema.type !== 'object' || !fieldSchema.properties) {
      return null
    }

    return (
      <div key={fieldName} className={styles.objectField}>
        <h4 className={styles.objectTitle}>{fieldSchema.title}</h4>
        {fieldSchema.description && (
          <p className={styles.objectDescription}>{fieldSchema.description}</p>
        )}
        <Row gutter={[16, 16]}>
          {Object.entries(fieldSchema.properties).map(([subFieldName, subFieldSchema]) => {
            const subField = subFieldSchema as FieldSchema
            const fullFieldName = `${fieldName}.${subFieldName}`
            const fieldWidth = subField.ui?.width || '100%'
            const { span } = parseWidth(fieldWidth)
            const isRequired = fieldSchema.required?.includes(subFieldName) || subField.required

            if (subField.type === 'object' && subField.properties) {
              return (
                <Col key={fullFieldName} span={span}>
                  {renderObjectField(fullFieldName, subField)}
                </Col>
              )
            }

            const isTagsField = subField.ui?.widget === 'tags' || 
                               (subField['x-component'] === 'tags' && subField.type === 'array')

            return (
              <Col key={fullFieldName} span={span}>
                <Form.Item
                  label={
                    <span className={styles.fieldLabel}>
                      {subField.title}
                      {isRequired && <span className={styles.requiredMark}>*</span>}
                    </span>
                  }
                  field={isTagsField ? undefined : fullFieldName}
                  rules={!isTagsField ? [
                    {
                      required: isRequired,
                      message: `请输入${subField.title}`
                    }
                  ] : undefined}
                  extra={subField.description}
                  className={styles.formItem}
                >
                  {isTagsField
                    ? renderFieldComponent(fullFieldName, subField)
                    : (subField.type === 'array' && !subField.ui?.widget
                        ? renderArrayFieldComponent(fullFieldName, subField)
                        : renderFieldComponent(fullFieldName, subField))}
                </Form.Item>
              </Col>
            )
          })}
        </Row>
      </div>
    )
  }

  const renderFields = () => {
    const { properties = {}, required = [], ui: formUI = {} } = schema
    const groups = formUI.groups || []

    const renderFormItem = (fieldName: string, fieldSchema: FieldSchema) => {
      const fieldWidth = fieldSchema.ui?.width || '100%'
      const { span } = parseWidth(fieldWidth)
      const isRequired = required.includes(fieldName) || fieldSchema.required
      const isTagsField = fieldSchema.ui?.widget === 'tags' || 
                         (fieldSchema['x-component'] === 'tags' && fieldSchema.type === 'array')

      return (
        <Col key={fieldName} span={span}>
          <Form.Item
            label={
              <span className={styles.fieldLabel}>
                {fieldSchema.title}
                {isRequired && <span className={styles.requiredMark}>*</span>}
              </span>
            }
            field={isTagsField ? undefined : fieldName}
            rules={!isTagsField ? [
              {
                required: isRequired,
                message: `请输入${fieldSchema.title}`
              }
            ] : undefined}
            extra={fieldSchema.description}
            className={styles.formItem}
          >
            {isTagsField
              ? renderFieldComponent(fieldName, fieldSchema)
              : (fieldSchema.type === 'array' && !fieldSchema.ui?.widget
                  ? renderArrayFieldComponent(fieldName, fieldSchema)
                  : renderFieldComponent(fieldName, fieldSchema))}
          </Form.Item>
        </Col>
      )
    }

    if (groups.length > 0) {
      return groups.map((group, groupIndex) => (
        <div key={groupIndex} className={styles.formGroup}>
          <h3 className={styles.groupTitle}>{group.title}</h3>
          <Row gutter={[16, 16]}>
            {group.fields.map(fieldName => {
              const fieldSchema = properties[fieldName]
              if (!fieldSchema) return null

              if (fieldSchema.type === 'object' && fieldSchema.properties) {
                return renderObjectField(fieldName, fieldSchema)
              }

              return renderFormItem(fieldName, fieldSchema)
            })}
          </Row>
        </div>
      ))
    }

    return (
      <Row gutter={[16, 16]}>
        {Object.entries(properties).map(([fieldName, fieldSchema]) => {
          if (fieldSchema.type === 'object' && fieldSchema.properties) {
            return renderObjectField(fieldName, fieldSchema)
          }

          return renderFormItem(fieldName, fieldSchema)
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

export type { FormSchema, FieldSchema, DynamicFormProps }
