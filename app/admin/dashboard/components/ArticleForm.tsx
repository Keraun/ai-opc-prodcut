"use client"

import { useState } from "react"
import { Button, Input, Form, Modal, Message } from "@arco-design/web-react"
import { RichTextEditor } from "@/components/RichTextEditor"
import { toast } from "sonner"

interface ArticleFormProps {
  visible: boolean
  onClose: () => void
  initialContent?: string
  onSuccess?: () => void
}

export function ArticleForm({ visible, onClose, initialContent = "", onSuccess }: ArticleFormProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (values: any) => {
    setSubmitting(true)
    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          status: "draft"
        })
      })

      const result = await response.json()
      if (result.success) {
        Message.success("资讯创建成功")
        form.resetFields()
        onSuccess?.()
        onClose()
      } else {
        Message.error(result.message || "创建失败")
      }
    } catch (error) {
      console.error("创建资讯失败:", error)
      Message.error("创建资讯失败")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="新建资讯"
      visible={visible}
      onCancel={onClose}
      footer={null}
      style={{ top: 20, width: 800 }}
    >
      <Form
        form={form}
        layout="vertical"
        onSubmit={handleSubmit}
        autoComplete="off"
        initialValues={{
          title: "",
          category: "",
          summary: "",
          author: "",
          tags: [],
          content: initialContent
        }}
      >
        <Form.Item
          field="title"
          label="文章标题"
          rules={[{ required: true, message: "请输入文章标题" }]}
        >
          <Input placeholder="请输入文章标题" />
        </Form.Item>

        <Form.Item
          field="category"
          label="文章分类"
        >
          <Input placeholder="请输入文章分类" />
        </Form.Item>

        <Form.Item
          field="summary"
          label="文章摘要"
          rules={[{ required: true, message: "请输入文章摘要" }]}
        >
          <Input.TextArea
            placeholder="请输入文章摘要"
            autoSize={{ minRows: 3, maxRows: 6 }}
            maxLength={150}
            showWordLimit
          />
        </Form.Item>

        <Form.Item
          field="author"
          label="作者"
        >
          <Input placeholder="请输入作者名称" />
        </Form.Item>

        <Form.Item
          field="content"
          label="文章内容"
          rules={[{ required: true, message: "请输入文章内容" }]}
        >
          <RichTextEditor />
        </Form.Item>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" htmlType="submit" loading={submitting}>
            保存
          </Button>
        </div>
      </Form>
    </Modal>
  )
}