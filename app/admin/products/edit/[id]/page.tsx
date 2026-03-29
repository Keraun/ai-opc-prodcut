"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button, Card, Input, Select, InputNumber, Spin } from "@arco-design/web-react"
import { 
  IconBold, 
  IconItalic, 
  IconUnderline, 
  IconOrderedList, 
  IconUnorderedList,
  IconLink,
  IconImage
} from "@arco-design/web-react/icon"
import { ChevronLeft as IconChevronLeft } from "lucide-react"
import { toast } from "sonner"
import styles from "../../products.module.css"

const TextArea = Input.TextArea
const Option = Select.Option

interface Product {
  id: number
  title: string
  description: string
  content: string
  price: number
  originalPrice?: number
  image?: string
  tags?: string[]
  category?: string
  categoryName?: string
  link?: string
  features?: string[]
  salesCount?: number
  rating?: number
  status: string
  created_at: string
  updated_at: string
}

function RichTextEditor({ 
  value, 
  onChange,
  placeholder = "请输入内容..."
}: { 
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleLink = () => {
    const url = prompt('请输入链接地址:', 'https://')
    if (url) {
      execCommand('createLink', url)
    }
  }

  const handleImage = () => {
    const url = prompt('请输入图片地址:', 'https://')
    if (url) {
      execCommand('insertImage', url)
    }
  }

  const toolbarItems = [
    { icon: <IconBold />, command: 'bold', title: '粗体' },
    { icon: <IconItalic />, command: 'italic', title: '斜体' },
    { icon: <IconUnderline />, command: 'underline', title: '下划线' },
    { icon: <IconOrderedList />, command: 'insertOrderedList', title: '有序列表' },
    { icon: <IconUnorderedList />, command: 'insertUnorderedList', title: '无序列表' },
  ]

  return (
    <div className={`${styles.richEditor} ${isFocused ? styles.richEditorFocused : ''}`}>
      <div className={styles.richToolbar}>
        {toolbarItems.map((item, index) => (
          <button
            key={index}
            type="button"
            className={styles.toolbarBtn}
            onClick={() => execCommand(item.command)}
            title={item.title}
          >
            {item.icon}
          </button>
        ))}
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={handleLink}
          title="插入链接"
        >
          <IconLink />
        </button>
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={handleImage}
          title="插入图片"
        >
          <IconImage />
        </button>
      </div>
      <div
        ref={editorRef}
        className={styles.richContent}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  )
}

function ProductForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  loading,
  mode
}: { 
  initialData?: Product
  onSubmit: (data: Partial<Product>) => void
  onCancel: () => void
  loading: boolean
  mode: 'new' | 'edit'
}) {
  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    description: '',
    content: '',
    price: 0,
    originalPrice: undefined,
    image: '',
    tags: [],
    category: '',
    categoryName: '',
    link: '',
    features: [],
    status: 'active',
    ...initialData
  })
  const [tagInput, setTagInput] = useState('')
  const [featureInput, setFeatureInput] = useState('')

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData
      })
    }
  }, [initialData])

  const handleSubmit = () => {
    if (!formData.title?.trim()) {
      toast.error('请输入产品名称')
      return
    }
    if (!formData.description?.trim()) {
      toast.error('请输入产品描述')
      return
    }
    onSubmit(formData)
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag)
    })
  }

  const addFeature = () => {
    if (featureInput.trim() && !formData.features?.includes(featureInput.trim())) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), featureInput.trim()]
      })
      setFeatureInput('')
    }
  }

  const removeFeature = (feature: string) => {
    setFormData({
      ...formData,
      features: formData.features?.filter(f => f !== feature)
    })
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>基本信息</h3>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              产品名称 <span className={styles.required}>*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(value) => setFormData({ ...formData, title: value })}
              placeholder="请输入产品名称"
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>产品分类</label>
            <Select
              value={formData.category}
              onChange={(value) => setFormData({ 
                ...formData, 
                category: value,
                categoryName: value === 'ai-tools' ? 'AI工具' : 
                             value === 'ai-services' ? 'AI服务' : 
                             value === 'ai-models' ? 'AI模型' : ''
              })}
              placeholder="请选择分类"
              allowClear
            >
              <Option value="ai-tools">AI工具</Option>
              <Option value="ai-services">AI服务</Option>
              <Option value="ai-models">AI模型</Option>
            </Select>
          </div>
        </div>

        <div className={styles.formField}>
          <label className={styles.fieldLabel}>
            产品描述 <span className={styles.required}>*</span>
          </label>
          <TextArea
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="请输入产品描述"
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.fieldLabel}>产品详情</label>
          <RichTextEditor
            value={formData.content || ''}
            onChange={(value) => setFormData({ ...formData, content: value })}
            placeholder="请输入产品详情内容..."
          />
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>价格与状态</h3>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>售价</label>
            <InputNumber
              value={formData.price}
              onChange={(value) => setFormData({ ...formData, price: value || 0 })}
              placeholder="请输入售价"
              min={0}
              prefix="¥"
              style={{ width: '100%' }}
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>原价</label>
            <InputNumber
              value={formData.originalPrice}
              onChange={(value) => setFormData({ ...formData, originalPrice: value || undefined })}
              placeholder="请输入原价"
              min={0}
              prefix="¥"
              style={{ width: '100%' }}
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>状态</label>
            <Select
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value })}
              style={{ width: '100%' }}
            >
              <Option value="active">上架</Option>
              <Option value="inactive">下架</Option>
            </Select>
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>媒体与链接</h3>
        <div className={styles.formField}>
          <label className={styles.fieldLabel}>产品图片</label>
          <Input
            value={formData.image}
            onChange={(value) => setFormData({ ...formData, image: value })}
            placeholder="请输入产品图片URL"
          />
        </div>
        <div className={styles.formField}>
          <label className={styles.fieldLabel}>产品链接</label>
          <Input
            value={formData.link}
            onChange={(value) => setFormData({ ...formData, link: value })}
            placeholder="请输入产品链接"
          />
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>标签与特性</h3>
        <div className={styles.formField}>
          <label className={styles.fieldLabel}>产品标签</label>
          <div className={styles.tagInput}>
            <Input
              value={tagInput}
              onChange={setTagInput}
              placeholder="输入标签后按回车添加"
              onPressEnter={addTag}
              style={{ flex: 1 }}
            />
            <Button type="primary" onClick={addTag}>添加</Button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className={styles.tagsList}>
              {formData.tags.map((tag, index) => (
                <span key={index} className={styles.tagItem}>
                  {tag}
                  <button 
                    type="button" 
                    className={styles.tagRemove}
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formField}>
          <label className={styles.fieldLabel}>产品特性</label>
          <div className={styles.tagInput}>
            <Input
              value={featureInput}
              onChange={setFeatureInput}
              placeholder="输入特性后按回车添加"
              onPressEnter={addFeature}
              style={{ flex: 1 }}
            />
            <Button type="primary" onClick={addFeature}>添加</Button>
          </div>
          {formData.features && formData.features.length > 0 && (
            <div className={styles.featuresList}>
              {formData.features.map((feature, index) => (
                <div key={index} className={styles.featureItem}>
                  <span>{feature}</span>
                  <button 
                    type="button" 
                    className={styles.featureRemove}
                    onClick={() => removeFeature(feature)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.formActions}>
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" loading={loading} onClick={handleSubmit}>
          {mode === 'new' ? '创建产品' : '保存修改'}
        </Button>
      </div>
    </div>
  )
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products?id=${productId}`)
      const result = await response.json()
      if (result.success && result.data) {
        setProduct(result.data)
      } else {
        toast.error('产品不存在')
        router.push('/admin/products')
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      toast.error('加载产品失败')
      router.push('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: Partial<Product>) => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          id: productId
        })
      })
      const result = await response.json()
      
      if (result.success) {
        toast.success('产品更新成功')
        router.push('/admin/products')
      } else {
        toast.error(result.message || '保存产品失败')
      }
    } catch (error) {
      console.error('Failed to save product:', error)
      toast.error('保存产品失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/products')
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size={40} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="text"
              icon={<IconChevronLeft />}
              onClick={handleCancel}
              style={{ color: 'white' }}
            >
              返回产品列表
            </Button>
            <h1 className={styles.headerTitle}>编辑产品</h1>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <Card className={styles.formCard}>
          <ProductForm
            mode="edit"
            initialData={product || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={submitting}
          />
        </Card>
      </div>
    </div>
  )
}
