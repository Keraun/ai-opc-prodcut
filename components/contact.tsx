"use client"

import { useState } from "react"
import { Card, Form, Input, Select, Button, Message } from "@arco-design/web-react"
import {
  IconLocation,
  IconPhone,
  IconEmail,
  IconSend,
} from "@arco-design/web-react/icon"

const FormItem = Form.Item
const TextArea = Input.TextArea

const contactInfo = [
  {
    icon: IconLocation,
    title: "公司地址",
    content: "北京市海淀区中关村科技园区",
    sub: "NexusAI大厦 18层",
  },
  {
    icon: IconPhone,
    title: "联系电话",
    content: "400-888-9999",
    sub: "周一至周五 9:00-18:00",
  },
  {
    icon: IconEmail,
    title: "电子邮箱",
    content: "contact@nexusai.com",
    sub: "24小时内回复",
  },
]

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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
    Message.success("感谢您的留言，我们会尽快与您联系！")
    form.resetFields()
  }

  return (
    <section id="contact" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            联系我们
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            准备好开启AI之旅了吗？
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            无论您有任何问题或合作意向，我们的团队随时为您服务
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <Card
                  key={index}
                  className="!bg-card/50 !border-border backdrop-blur-sm"
                >
                  <div className="flex gap-4 p-2">
                    <div className="shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Icon className="text-xl text-accent" />
                    </div>
                    <div>
                      <h3 className="text-sm text-muted-foreground mb-1">{info.title}</h3>
                      <p className="text-foreground font-medium">{info.content}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{info.sub}</p>
                    </div>
                  </div>
                </Card>
              )
            })}

            {/* Social Links */}
            <Card className="!bg-card/50 !border-border backdrop-blur-sm">
              <div className="p-2 text-center">
                <p className="text-sm text-muted-foreground mb-3">关注我们获取最新动态</p>
                <div className="flex justify-center gap-4">
                  {["微信", "微博", "LinkedIn"].map((platform) => (
                    <div
                      key={platform}
                      className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xs text-muted-foreground hover:bg-accent/10 hover:text-accent transition-colors cursor-pointer"
                    >
                      {platform[0]}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-3 !bg-card/50 !border-border backdrop-blur-sm">
            <div className="p-2 md:p-4">
              <h3 className="text-xl font-bold text-foreground mb-6">发送留言</h3>
              <Form
                form={form}
                layout="vertical"
                onSubmit={handleSubmit}
                className="[&_.arco-form-label-item]:!text-muted-foreground [&_.arco-form-label-item>label]:!text-muted-foreground"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormItem
                    label="您的姓名"
                    field="name"
                    rules={[{ required: true, message: "请输入姓名" }]}
                  >
                    <Input
                      placeholder="请输入您的姓名"
                      className="!bg-secondary !border-border !text-foreground placeholder:!text-muted-foreground"
                    />
                  </FormItem>
                  <FormItem
                    label="联系电话"
                    field="phone"
                    rules={[{ required: true, message: "请输入联系电话" }]}
                  >
                    <Input
                      placeholder="请输入您的电话"
                      className="!bg-secondary !border-border !text-foreground placeholder:!text-muted-foreground"
                    />
                  </FormItem>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormItem
                    label="电子邮箱"
                    field="email"
                    rules={[
                      { required: true, message: "请输入邮箱" },
                      { type: "email", message: "请输入有效的邮箱地址" },
                    ]}
                  >
                    <Input
                      placeholder="请输入您的邮箱"
                      className="!bg-secondary !border-border !text-foreground placeholder:!text-muted-foreground"
                    />
                  </FormItem>
                  <FormItem
                    label="咨询类型"
                    field="type"
                    rules={[{ required: true, message: "请选择咨询类型" }]}
                  >
                    <Select
                      placeholder="请选择咨询类型"
                      options={businessTypes}
                      className="[&_.arco-select-view]:!bg-secondary [&_.arco-select-view]:!border-border"
                    />
                  </FormItem>
                </div>

                <FormItem
                  label="公司名称"
                  field="company"
                >
                  <Input
                    placeholder="请输入您的公司名称（选填）"
                    className="!bg-secondary !border-border !text-foreground placeholder:!text-muted-foreground"
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
                    className="!bg-secondary !border-border !text-foreground placeholder:!text-muted-foreground"
                  />
                </FormItem>

                <FormItem>
                  <Button
                    type="primary"
                    htmlType="submit"
                    long
                    loading={loading}
                    className="!bg-accent !text-accent-foreground hover:!bg-accent/90 !h-12 !text-base"
                  >
                    <IconSend className="mr-2" />
                    提交留言
                  </Button>
                </FormItem>
              </Form>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
