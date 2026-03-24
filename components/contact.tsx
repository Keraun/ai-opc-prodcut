"use client"

import { useState } from "react"
import { Card, Form, Input, Select, Button, Message } from "@arco-design/web-react"
import { IconSend } from "@arco-design/web-react/icon"

const FormItem = Form.Item
const TextArea = Input.TextArea

const businessTypes = [
  { label: "产品咨询", value: "product" },
  { label: "技术支持", value: "support" },
  { label: "商务合作", value: "business" },
  { label: "加入我们", value: "career" },
  { label: "其他", value: "other" },
]

export function Contact() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
    Message.success("感谢您的留言，我们会尽快与您联系！")
    form.resetFields()
  }

  return (
    <section id="contact" className="relative py-24 md:py-32 bg-gradient-to-b from-gray-50/50 to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Decorative Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4 border border-blue-100">
            联系我们
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-balance">
            准备好开启AI之旅了吗？
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            无论您有任何问题或合作意向，我们的团队随时为您服务
          </p>
        </div>

        {/* Contact Form */}
        <Card className="!bg-white !border-gray-100 hover:!border-gray-200 hover:!shadow-xl transition-all duration-300">
          <div className="p-6 md:p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">发送留言</h3>
            <Form
              form={form}
              layout="vertical"
              onSubmit={handleSubmit}
              className="[&_.arco-form-label-item]:!text-gray-600 [&_.arco-form-label-item>label]:!text-gray-600 [&_.arco-form-label-item>label]:!font-medium"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <FormItem
                  label="您的姓名"
                  field="name"
                  rules={[{ required: true, message: "请输入姓名" }]}
                >
                  <Input
                    placeholder="请输入您的姓名"
                    className="!bg-gray-50 !border-gray-200 !text-gray-900 placeholder:!text-gray-400 hover:!border-blue-300 focus:!border-blue-500 transition-colors !rounded-xl"
                  />
                </FormItem>
                <FormItem
                  label="联系电话"
                  field="phone"
                  rules={[{ required: true, message: "请输入联系电话" }]}
                >
                  <Input
                    placeholder="请输入您的电话"
                    className="!bg-gray-50 !border-gray-200 !text-gray-900 placeholder:!text-gray-400 hover:!border-blue-300 focus:!border-blue-500 transition-colors !rounded-xl"
                  />
                </FormItem>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <FormItem
                  label="电子邮箱"
                  field="email"
                  rules={[
                    { type: "email", message: "请输入有效的邮箱地址" },
                  ]}
                >
                  <Input
                    placeholder="请输入您的邮箱（选填）"
                    className="!bg-gray-50 !border-gray-200 !text-gray-900 placeholder:!text-gray-400 hover:!border-blue-300 focus:!border-blue-500 transition-colors !rounded-xl"
                  />
                </FormItem>
                <FormItem
                  label="咨询类型"
                  field="type"
                >
                  <Select
                    placeholder="请选择咨询类型（选填）"
                    options={businessTypes}
                    className="[&_.arco-select-view]:!bg-gray-50 [&_.arco-select-view]:!border-gray-200 [&_.arco-select-view]:hover:!border-blue-300 [&_.arco-select-view]:focus:!border-blue-500 !rounded-xl [&_.arco-select-view]:!h-10"
                  />
                </FormItem>
              </div>

              <FormItem
                label="公司名称"
                field="company"
              >
                <Input
                  placeholder="请输入您的公司名称（选填）"
                  className="!bg-gray-50 !border-gray-200 !text-gray-900 placeholder:!text-gray-400 hover:!border-blue-300 focus:!border-blue-500 transition-colors !rounded-xl"
                />
              </FormItem>

              <FormItem
                label="留言内容"
                field="message"
                rules={[{ required: true, message: "请输入留言内容" }]}
              >
                <TextArea
                  placeholder="请详细描述您的需求或问题..."
                  autoSize={{ minRows: 4, maxRows: 6 }}
                  className="!bg-gray-50 !border-gray-200 !text-gray-900 placeholder:!text-gray-400 hover:!border-blue-300 focus:!border-blue-500 transition-colors !rounded-xl"
                />
              </FormItem>

              <FormItem>
                <Button
                  type="primary"
                  htmlType="submit"
                  long
                  loading={loading}
                  className="!bg-gradient-to-r !from-blue-600 !to-blue-700 !text-white hover:!from-blue-700 hover:!to-blue-800 !h-12 !text-base !rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 hover:-translate-y-0.5"
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
