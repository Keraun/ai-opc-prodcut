"use client"

import { useState } from "react"
import { Card, Form, Input, Button, Message, Radio } from "@arco-design/web-react"
import { IconSend } from "@arco-design/web-react/icon"
import { useTheme } from "@/components/theme-provider"

const FormItem = Form.Item
const TextArea = Input.TextArea
const RadioGroup = Radio.Group

const contactPreferences = [
  { label: "电话", value: "phone" },
  { label: "微信", value: "wechat" },
  { label: "邮箱", value: "email" },
]

interface ContactProps {
  data?: any
}

export function Contact({ data }: ContactProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { themeConfig } = useTheme()

  const config = data || {}

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

      const data = await response.json()
      if (data.success) {
        Message.success(data.message)
        form.resetFields()
      } else {
        Message.error(data.message)
      }
    } catch (error) {
      Message.error("提交留言失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="relative py-16 md:py-24 bg-gradient-to-b from-gray-50/50 to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Decorative Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4 border"
            style={{
              backgroundColor: `${accentColor}0D`,
              color: accentColor,
              borderColor: `${accentColor}33`
            }}
          >
            {config.sectionTag || "联系我们"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            {config.title || "准备好开启AI之旅了吗？"}
          </h2>
          <p className="text-base text-gray-500 max-w-xl mx-auto">
            {config.description || "留下您的联系方式，我们会尽快与您取得联系"}
          </p>
        </div>

        {/* Contact Form */}
        <Card className="!bg-white !border-gray-100 hover:!shadow-lg transition-all duration-300">
          <div className="p-5 md:p-6">
            <Form
              form={form}
              layout="vertical"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <FormItem
                  label="姓名"
                  field="name"
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <Input placeholder="请输入您的姓名" />
                </FormItem>

                <FormItem
                  label="手机号"
                  field="phone"
                  rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                  ]}
                >
                  <Input placeholder="请输入您的手机号" />
                </FormItem>
              </div>

              <FormItem
                label="联系偏好"
                field="contactPreference"
                initialValue="phone"
              >
                <RadioGroup options={contactPreferences} type="button" />
              </FormItem>

              <FormItem
                label="留言内容"
                field="message"
                rules={[{ required: true, message: '请输入留言内容' }]}
              >
                <TextArea
                  placeholder="请描述您的需求或问题..."
                  rows={4}
                  maxLength={{ length: 500, errorOnly: true }}
                  showWordLimit
                />
              </FormItem>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                long
                size="large"
                style={{ backgroundColor: primaryColor }}
                icon={<IconSend />}
              >
                {config.submitButtonText || "提交留言"}
              </Button>
            </Form>
          </div>
        </Card>
      </div>
    </section>
  )
}
