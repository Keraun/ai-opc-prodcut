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

export function Contact() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { themeConfig } = useTheme()
  
  const primaryColor = themeConfig?.colors?.primary || "#1e40af"
  const secondaryColor = themeConfig?.colors?.secondary || "#3b82f6"
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
            联系我们
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            准备好开启AI之旅了吗？
          </h2>
          <p className="text-base text-gray-500 max-w-xl mx-auto">
            留下您的联系方式，我们会尽快与您取得联系
          </p>
        </div>

        {/* Contact Form */}
        <Card className="!bg-white !border-gray-100 hover:!shadow-lg transition-all duration-300">
          <div className="p-5 md:p-6">
            <Form
              form={form}
              layout="vertical"
              onSubmit={handleSubmit}
              initialValues={{ preference: "phone" }}
              className="[&_.arco-form-label-item]:!text-gray-600 [&_.arco-form-label-item>label]:!text-gray-600 [&_.arco-form-label-item>label]:!font-medium [&_.arco-form-label-item>label]:!text-sm"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <FormItem
                  label="您的姓名"
                  field="name"
                  rules={[{ required: true, message: "请输入姓名" }]}
                >
                  <Input
                    placeholder="请输入姓名"
                    className="!bg-gray-50 !border-gray-200 !text-gray-900 placeholder:!text-gray-400 hover:!border-blue-300 focus:!border-blue-500 transition-colors !rounded-lg !h-10"
                  />
                </FormItem>
                <FormItem
                  label="联系电话"
                  field="phone"
                  rules={[{ required: true, message: "请输入联系电话" }]}
                >
                  <Input
                    placeholder="请输入电话"
                    className="!bg-gray-50 !border-gray-200 !text-gray-900 placeholder:!text-gray-400 hover:!border-blue-300 focus:!border-blue-500 transition-colors !rounded-lg !h-10"
                  />
                </FormItem>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormItem
                  label="微信号"
                  field="wechat"
                >
                  <Input
                    placeholder="请输入微信号（选填）"
                    className="!bg-gray-50 !border-gray-200 !text-gray-900 placeholder:!text-gray-400 hover:!border-blue-300 focus:!border-blue-500 transition-colors !rounded-lg !h-10"
                  />
                </FormItem>
                <FormItem
                  label="电子邮箱"
                  field="email"
                  rules={[
                    { type: "email", message: "请输入有效的邮箱地址" },
                  ]}
                >
                  <Input
                    placeholder="请输入邮箱（选填）"
                    className="!bg-gray-50 !border-gray-200 !text-gray-900 placeholder:!text-gray-400 hover:!border-blue-300 focus:!border-blue-500 transition-colors !rounded-lg !h-10"
                  />
                </FormItem>
              </div>

              <FormItem
                label="偏好联系方式"
                field="preference"
              >
                <RadioGroup>
                  {contactPreferences.map((item) => (
                    <Radio key={item.value} value={item.value}>
                      {item.label}
                    </Radio>
                  ))}
                </RadioGroup>
              </FormItem>

              <FormItem
                label="留言内容"
                field="message"
                rules={[{ required: true, message: "请输入留言内容" }]}
              >
                <TextArea
                  placeholder="请描述您的需求或问题..."
                  autoSize={{ minRows: 3, maxRows: 5 }}
                  className="!bg-gray-50 !border-gray-200 !text-gray-900 placeholder:!text-gray-400 hover:!border-blue-300 focus:!border-blue-500 transition-colors !rounded-lg"
                />
              </FormItem>

              <FormItem className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  long
                  loading={loading}
                  style={{ 
                    backgroundColor: primaryColor,
                    color: 'white'
                  }}
                  className="!h-11 !text-base !rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <IconSend className="mr-2" />
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
