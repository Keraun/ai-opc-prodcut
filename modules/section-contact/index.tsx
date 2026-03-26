"use client"

import { useState } from "react"
import { Card, Form, Input, Button, Message, Radio } from "@arco-design/web-react"
import { IconSend } from "@arco-design/web-react/icon"
import { useTheme } from "@/components/theme-provider"
import type { ModuleProps } from "@/modules/types"
import type { ContactData } from "./types"
import styles from "./index.module.css"

const FormItem = Form.Item
const TextArea = Input.TextArea
const RadioGroup = Radio.Group

const contactPreferences = [
  { label: "电话", value: "phone" },
  { label: "微信", value: "wechat" },
  { label: "邮箱", value: "email" },
]

export function ContactModule({ data }: ModuleProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { themeConfig } = useTheme()

  const config: ContactData = (data as ContactData) || {}

  const primaryColor = themeConfig?.colors?.primary || "#1e40af"
  const accentColor = themeConfig?.colors?.accent || "#06b6d4"

  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })

      const result = await response.json()
      if (result.success) {
        Message.success(result.message)
        form.resetFields()
      } else {
        Message.error(result.message)
      }
    } catch (error) {
      Message.error("提交留言失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className={styles.section}>
      <div className={styles.bgPattern} />
      <div className={styles.decorativeOrb1} />
      <div className={styles.decorativeOrb2} />

      <div className={styles.container}>
        <div className={styles.header}>
          <span
            className={styles.tag}
            style={{
              backgroundColor: `${accentColor}0D`,
              color: accentColor,
              borderColor: `${accentColor}33`
            }}
          >
            {config.sectionTag || "联系我们"}
          </span>
          <h2 className={styles.title}>
            {config.title || "准备好开启AI之旅了吗？"}
          </h2>
          <p className={styles.description}>
            {config.description || "留下您的联系方式，我们会尽快与您取得联系"}
          </p>
        </div>

        <Card className={styles.card}>
          <div className={styles.cardContent}>
            <Form
              form={form}
              layout="vertical"
              onSubmit={handleSubmit}
              className={styles.form}
            >
              <div className={styles.formGrid}>
                <FormItem
                  label="姓名"
                  field="name"
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <Input placeholder="请输入您的姓名" />
                </FormItem>

                <FormItem
                  label="电话"
                  field="phone"
                  rules={[{ required: true, message: '请输入电话' }]}
                >
                  <Input placeholder="请输入您的电话号码" />
                </FormItem>
              </div>

              <FormItem
                label="邮箱"
                field="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入您的邮箱地址" />
              </FormItem>

              <FormItem
                label="公司名称"
                field="company"
              >
                <Input placeholder="请输入您的公司名称（选填）" />
              </FormItem>

              <FormItem
                label="偏好联系方式"
                field="contactPreference"
                initialValue="wechat"
              >
                <RadioGroup>
                  {contactPreferences.map((pref) => (
                    <Radio key={pref.value} value={pref.value}>
                      {pref.label}
                    </Radio>
                  ))}
                </RadioGroup>
              </FormItem>

              <FormItem
                label="留言"
                field="message"
                rules={[{ required: true, message: '请输入留言内容' }]}
              >
                <TextArea
                  placeholder="请简单描述您的需求或问题"
                  autoSize={{ minRows: 4, maxRows: 6 }}
                />
              </FormItem>

              <FormItem>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className={styles.submitButton}
                  style={{ backgroundColor: primaryColor }}
                >
                  <IconSend style={{ marginRight: '0.5rem' }} />
                  提交留言
                </Button>
              </FormItem>
            </Form>
          </div>
        </Card>
      </div>
    </section>
  )
}
