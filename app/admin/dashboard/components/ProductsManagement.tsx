"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button, Card, Table, Input, Select, InputNumber, Spin } from "@arco-design/web-react"
import { 
  IconPlus, 
  IconDelete, 
  IconEdit, 
  IconEye, 
  IconLeft,
  IconBold, 
  IconItalic, 
  IconUnderline, 
  IconOrderedList, 
  IconUnorderedList,
  IconLink,
  IconImage
} from "@arco-design/web-react/icon"
import { toast } from "sonner"
import styles from "./ProductsManagement.module.css"

const TextArea = Input.TextArea
const Option = Select.Option

interface Product {
  id?: number
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
  created_at?: string
  updated_at?: string
}

type ViewMode = 'list' | 'new' | 'edit' | 'view'

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
  }, [])

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
  onSubmit: (data: Product) => void
  onCancel: () => void
  loading: boolean
  mode: 'new' | 'edit'
}) {
  const [formData, setFormData] = useState<Product>({
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

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error('请输入产品名称')
      return
    }
    if (!formData.description.trim()) {
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

function ProductView({ product, onBack }: { product: Product; onBack: () => void }) {
  const formatPrice = (price: number) => {
    if (price === 0) return '免费'
    return `¥${price}`
  }

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        <Button type="text" icon={<IconLeft />} onClick={onBack}>
          返回列表
        </Button>
        <h2 className={styles.viewTitle}>{product.title}</h2>
      </div>

      <Card className={styles.viewCard}>
        <div className={styles.viewContent}>
          <div className={styles.viewSection}>
            <div className={styles.viewRow}>
              <div className={styles.viewField}>
                <span className={styles.viewLabel}>分类</span>
                <p className={styles.viewValue}>{product.categoryName || '-'}</p>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewLabel}>状态</span>
                <p className={styles.viewValue}>
                  <span className={`${styles.statusBadge} ${product.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                    {product.status === 'active' ? '上架' : '下架'}
                  </span>
                </p>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewLabel}>销量</span>
                <p className={styles.viewValue}>{product.salesCount || 0}</p>
              </div>
            </div>

            <div className={styles.viewField}>
              <span className={styles.viewLabel}>价格</span>
              <p className={styles.viewPrice}>
                {formatPrice(product.price)}
                {product.originalPrice && product.originalPrice > product.price && (
                  <span style={{ textDecoration: 'line-through', color: '#c9cdd4', marginLeft: '8px', fontSize: '0.875rem' }}>
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </p>
            </div>

            <div className={styles.viewField}>
              <span className={styles.viewLabel}>描述</span>
              <p className={styles.viewValue}>{product.description}</p>
            </div>

            {product.image && (
              <div className={styles.viewField}>
                <span className={styles.viewLabel}>产品图片</span>
                <div className={styles.imagePreview}>
                  <img src={product.image} alt={product.title} />
                </div>
              </div>
            )}

            {product.link && (
              <div className={styles.viewField}>
                <span className={styles.viewLabel}>产品链接</span>
                <p className={styles.viewValue}>
                  <a href={product.link} target="_blank" rel="noopener noreferrer" className={styles.viewLink}>
                    {product.link}
                  </a>
                </p>
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className={styles.viewField}>
                <span className={styles.viewLabel}>标签</span>
                <div className={styles.tagsList}>
                  {product.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {product.features && product.features.length > 0 && (
              <div className={styles.viewField}>
                <span className={styles.viewLabel}>特性</span>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  {product.features.map((feature, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>
                      <span className={styles.featureIcon}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {product.content && (
            <div className={styles.viewSection}>
              <span className={styles.viewLabel}>产品详情</span>
              <div className={styles.htmlContent} dangerouslySetInnerHTML={{ __html: product.content }} />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products?admin=true')
      const result = await response.json()
      if (result.success && result.data) {
        setProducts(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('获取产品列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = () => {
    setCurrentProduct(null)
    setViewMode('new')
  }

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product)
    setViewMode('edit')
  }

  const handleViewProduct = (product: Product) => {
    setCurrentProduct(product)
    setViewMode('view')
  }

  const handleDeleteProduct = async (product: Product) => {
    if (confirm(`确定要删除产品 "${product.title}" 吗？`)) {
      try {
        const response = await fetch(`/api/products?id=${product.id}`, {
          method: 'DELETE'
        })
        const result = await response.json()
        
        if (result.success) {
          setProducts(products.filter(p => p.id !== product.id))
          toast.success('产品删除成功')
        } else {
          toast.error('删除产品失败')
        }
      } catch (error) {
        console.error('Failed to delete product:', error)
        toast.error('删除产品失败')
      }
    }
  }

  const handleSubmit = async (data: Product) => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          id: viewMode === 'edit' ? currentProduct?.id : undefined
        })
      })
      const result = await response.json()
      
      if (result.success) {
        toast.success(viewMode === 'new' ? '产品创建成功' : '产品更新成功')
        await fetchProducts()
        setViewMode('list')
        setCurrentProduct(null)
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
    setViewMode('list')
    setCurrentProduct(null)
  }

  const formatPrice = (price: number) => {
    if (price === 0) return '免费'
    return `¥${price}`
  }

  const columns = [
    {
      title: '产品名称',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text: string) => (
        <div className={styles.titleCell}>{text}</div>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <div className={styles.descriptionCell}>{text}</div>
      )
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number, record: Product) => (
        <div className={styles.priceCell}>
          <span className={styles.currentPrice}>{formatPrice(price)}</span>
          {record.originalPrice && record.originalPrice > price && (
            <span className={styles.originalPrice}>{formatPrice(record.originalPrice)}</span>
          )}
        </div>
      )
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 100
    },
    {
      title: '销量',
      dataIndex: 'salesCount',
      key: 'salesCount',
      width: 80,
      render: (count: number) => count || 0
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <span className={`${styles.statusBadge} ${status === 'active' ? styles.statusActive : styles.statusInactive}`}>
          {status === 'active' ? '上架' : '下架'}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Product) => (
        <div className={styles.actionButtons}>
          <Button
            type="text"
            size="small"
            icon={<IconEye />}
            onClick={() => handleViewProduct(record)}
          >
            查看
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<IconEdit />}
            onClick={() => handleEditProduct(record)}
          >
            编辑
          </Button>
          <Button
            status="danger"
            size="small"
            icon={<IconDelete />}
            onClick={() => handleDeleteProduct(record)}
          >
            删除
          </Button>
        </div>
      )
    }
  ]

  if (viewMode === 'view' && currentProduct) {
    return <ProductView product={currentProduct} onBack={handleCancel} />
  }

  if (viewMode === 'new' || viewMode === 'edit') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Button
                type="text"
                icon={<IconLeft />}
                onClick={handleCancel}
                style={{ color: 'white' }}
              >
                返回列表
              </Button>
              <h1 className={styles.headerTitle}>{viewMode === 'new' ? '新建产品' : '编辑产品'}</h1>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <Card className={styles.formCard}>
            <ProductForm
              mode={viewMode}
              initialData={currentProduct}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={submitting}
            />
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.headerTitle}>产品管理</h1>
            <p className={styles.headerDescription}>管理网站产品信息，包括价格、特性、分类等</p>
          </div>
          <Button
            type="primary"
            icon={<IconPlus />}
            onClick={handleAddProduct}
          >
            新建产品
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin size={32} />
          </div>
        ) : (
          <Card className={styles.tableCard}>
            <Table
              columns={columns}
              data={products}
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showTotal: true,
                showJumper: true
              }}
            />
          </Card>
        )}
      </div>
    </div>
  )
}
