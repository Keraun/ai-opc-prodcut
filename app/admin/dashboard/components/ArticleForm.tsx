"use client"

import { useState, useRef, useEffect } from "react"
import { Button, Input, Form, Modal, Message, Tag as ArcoTag } from "@arco-design/web-react"
import { RichTextEditor } from "@/components/RichTextEditor"
import { toast } from "sonner"
import { Newspaper, Tag, FileText, Image as ImageIcon, X, Plus } from "lucide-react"
import styles from "./ArticleForm.module.css"

// Markdown 转 HTML 的简单实现
function markdownToHtml(markdown: string): string {
  if (!markdown) return ""

  let html = markdown

  // 转义 HTML 特殊字符
  html = html.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // 代码块 (```code```)
  html = html.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")

  // 行内代码 (`code`)
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>")

  // 标题 (# ## ### #### ##### ######)
  html = html.replace(/^###### (.*$)/gim, "<h6>$1</h6>")
  html = html.replace(/^##### (.*$)/gim, "<h5>$1</h5>")
  html = html.replace(/^#### (.*$)/gim, "<h4>$1</h4>")
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>")
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>")
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>")

  // 粗体 (**text** 或 __text__)
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>")

  // 斜体 (*text* 或 _text_)
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>")
  html = html.replace(/_(.*?)_/g, "<em>$1</em>")

  // 删除线 (~~text~~)
  html = html.replace(/~~(.*?)~~/g, "<del>$1</del>")

  // 链接 ([text](url))
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // 图片 (![alt](url))
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

  // 无序列表 (- item 或 * item)
  html = html.replace(/^\s*[-*] (.*$)/gim, "<li>$1</li>")
  html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
  html = html.replace(/<\/ul>\s*<ul>/g, "")

  // 有序列表 (1. item)
  html = html.replace(/^\s*\d+\. (.*$)/gim, "<li>$1</li>")
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    if (match.includes("<ul>")) return match
    return `<ol>${match}</ol>`
  })

  // 引用 (> text)
  html = html.replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")

  // 水平线 (--- 或 *** 或 ___)
  html = html.replace(/^(---|___|\*\*\*)$/gim, "<hr />")

  // 换行符转 <br>
  html = html.replace(/\n/g, "<br />")

  // 段落 (如果没有被其他标签包裹)
  html = html.replace(/([^>])<br \/><br \/>/g, "$1</p><p>")
  html = html.replace(/^([^<].*)/gim, "<p>$1</p>")
  html = html.replace(/<p><\/p>/g, "")

  return html
}

interface ArticleFormProps {
  visible: boolean
  onClose: () => void
  initialContent?: string
  onSuccess?: () => void
}

export function ArticleForm({ visible, onClose, initialContent = "", onSuccess }: ArticleFormProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [seoKeywords, setSeoKeywords] = useState<string[]>([])
  const [seoKeywordInput, setSeoKeywordInput] = useState("")
  const [mainImage, setMainImage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 将 markdown 转换为 HTML
  const convertedContent = markdownToHtml(initialContent)

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        title: "",
        category: "",
        summary: "",
        author: "",
        content: convertedContent,
        seoTitle: "",
        seoDescription: "",
      })
      setTags([])
      setSeoKeywords([])
      setMainImage("")
    }
  }, [visible, convertedContent, form])

  const handleSubmit = async (values: any) => {
    setSubmitting(true)
    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          tags,
          mainImage,
          seo: {
            title: values.seoTitle,
            description: values.seoDescription,
            keywords: seoKeywords,
          },
          status: "draft",
        }),
      })

      const result = await response.json()
      if (result.success) {
        Message.success("资讯创建成功")
        form.resetFields()
        setTags([])
        setSeoKeywords([])
        setMainImage("")
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

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleAddSeoKeyword = () => {
    if (seoKeywordInput.trim() && !seoKeywords.includes(seoKeywordInput.trim())) {
      setSeoKeywords([...seoKeywords, seoKeywordInput.trim()])
      setSeoKeywordInput("")
    }
  }

  const handleRemoveSeoKeyword = (keyword: string) => {
    setSeoKeywords(seoKeywords.filter((k) => k !== keyword))
  }

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload?quality=85", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success && result.url) {
        setMainImage(result.url)
        toast.success(`图片上传成功，节省 ${result.savedPercentage}% 空间`)
      } else {
        toast.error(result.message || "图片上传失败")
      }
    } catch (error) {
      console.error("Image upload error:", error)
      toast.error("图片上传失败")
    }
  }

  const handleGenerateRandomImage = () => {
    const randomWidth = 800
    const randomHeight = 600
    const randomId = Math.floor(Math.random() * 1000)
    const randomImageUrl = `https://picsum.photos/id/${randomId}/${randomWidth}/${randomHeight}`
    setMainImage(randomImageUrl)
    toast.success("随机主图生成成功")
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("图片大小不能超过5MB")
        return
      }
      if (!file.type.startsWith("image/")) {
        toast.error("请选择图片文件")
        return
      }
      handleImageUpload(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Modal
      title="新建资讯"
      visible={visible}
      onCancel={onClose}
      footer={null}
      style={{ top: 20, width: 900 }}
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
          content: convertedContent,
          seoTitle: "",
          seoDescription: "",
        }}
      >
        {/* 文章标题 */}
        <Form.Item
          field="title"
          label={<span className={styles.fieldLabel}><Newspaper size={16} /> 文章标题</span>}
          rules={[{ required: true, message: "请输入文章标题" }]}
        >
          <Input placeholder="请输入文章标题" />
        </Form.Item>

        {/* 分类与标签 - 内联组 */}
        <div className={styles.inlineGroup}>
          <div className={styles.inlineGroupTitle}>分类与标签</div>
          <div className={styles.inlineFields}>
            <Form.Item
              field="category"
              label={<span className={styles.fieldLabel}><Tag size={16} /> 文章分类</span>}
              className={styles.inlineField}
            >
              <Input placeholder="请输入文章分类" />
            </Form.Item>

            <div className={`${styles.formGroup} ${styles.inlineField}`}>
              <label className={styles.fieldLabel}>
                <Tag size={16} /> 文章标签
              </label>
              <div className={styles.tagsContainer}>
                <div className={styles.tagInput}>
                  <Input
                    value={tagInput}
                    onChange={setTagInput}
                    onPressEnter={handleAddTag}
                    placeholder="输入标签后按回车添加"
                  />
                  <Button type="primary" onClick={handleAddTag}>
                    <Plus size={16} />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className={styles.tags}>
                    {tags.map((tag, index) => (
                      <ArcoTag
                        key={index}
                        closable
                        onClose={() => handleRemoveTag(tag)}
                        color="purple"
                      >
                        {tag}
                      </ArcoTag>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 摘要与SEO - 内联组 */}
        <div className={styles.inlineGroup}>
          <div className={styles.inlineGroupTitle}>摘要与SEO</div>
          <div className={styles.inlineFields}>
            <div className={`${styles.formGroup} ${styles.inlineField}`}>
              <label className={styles.fieldLabel}>
                <ImageIcon size={16} /> 资讯主图
              </label>
              <div className={styles.imageUploadContainer}>
                {mainImage ? (
                  <div className={styles.imagePreviewWrapper}>
                    <img src={mainImage} alt="主图" className={styles.imagePreview} />
                    <button
                      type="button"
                      onClick={() => setMainImage("")}
                      className={styles.removeImageButton}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.imageUploadPlaceholder}>
                    <div
                      style={{ cursor: "pointer" }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon size={40} />
                      <span>点击上传图片</span>
                      <span className={styles.imageHint}>建议尺寸: 1200x630px</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateRandomImage}
                      className={styles.generateImageButton}
                    >
                      随机生成主图
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
              </div>
            </div>

            <Form.Item
              field="summary"
              label={<span className={styles.fieldLabel}><FileText size={16} /> 文章摘要</span>}
              rules={[{ required: true, message: "请输入文章摘要" }]}
              className={styles.inlineField}
            >
              <Input.TextArea
                placeholder="请输入文章摘要"
                autoSize={{ minRows: 4, maxRows: 6 }}
                maxLength={150}
                showWordLimit
              />
            </Form.Item>
          </div>
        </div>

        {/* 作者 */}
        <Form.Item
          field="author"
          label={<span className={styles.fieldLabel}><Newspaper size={16} /> 作者</span>}
        >
          <Input placeholder="请输入作者名称" />
        </Form.Item>

        {/* SEO标题与关键词 */}
        <div className={styles.inlineGroup}>
          <div className={styles.inlineGroupTitle}>SEO标题与关键词</div>
          <div className={styles.inlineFields}>
            <Form.Item
              field="seoTitle"
              label={<span className={styles.fieldLabel}><Tag size={16} /> SEO 标题</span>}
              className={styles.inlineField}
            >
              <Input placeholder="SEO 标题（留空则使用文章标题）" />
            </Form.Item>

            <div className={`${styles.formGroup} ${styles.inlineField}`}>
              <label className={styles.fieldLabel}>
                <Tag size={16} /> SEO 关键词
              </label>
              <div className={styles.tagsContainer}>
                <div className={styles.tagInput}>
                  <Input
                    value={seoKeywordInput}
                    onChange={setSeoKeywordInput}
                    onPressEnter={handleAddSeoKeyword}
                    placeholder="输入关键词后按回车添加"
                  />
                  <Button type="primary" onClick={handleAddSeoKeyword}>
                    <Plus size={16} />
                  </Button>
                </div>
                {seoKeywords.length > 0 && (
                  <div className={styles.tags}>
                    {seoKeywords.map((keyword, index) => (
                      <ArcoTag
                        key={index}
                        closable
                        onClose={() => handleRemoveSeoKeyword(keyword)}
                        color="blue"
                      >
                        {keyword}
                      </ArcoTag>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SEO描述 */}
        <Form.Item
          field="seoDescription"
          label={<span className={styles.fieldLabel}><FileText size={16} /> SEO 描述</span>}
        >
          <Input.TextArea
            placeholder="SEO 描述（留空则使用文章摘要）"
            autoSize={{ minRows: 3, maxRows: 5 }}
            maxLength={160}
            showWordLimit
          />
        </Form.Item>

        {/* 文章内容 */}
        <Form.Item
          field="content"
          label={<span className={styles.fieldLabel}><FileText size={16} /> 文章内容</span>}
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
