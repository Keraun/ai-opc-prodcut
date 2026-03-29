"use client"

import { useState, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  ArrowLeft,
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Save,
  X,
  Package,
  DollarSign,
  Tag,
  FileText,
  Image as ImageIcon
} from "lucide-react"
import { toast } from "sonner"
import styles from "./ProductsManagement.module.css"

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
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className={styles.editor}>
      <div className={styles.editorToolbar}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${styles.toolbarButton} ${editor.isActive('bold') ? styles.toolbarButtonActive : ''}`}
          title="粗体"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${styles.toolbarButton} ${editor.isActive('italic') ? styles.toolbarButtonActive : ''}`}
          title="斜体"
        >
          <Italic size={16} />
        </button>
        <div className={styles.toolbarDivider} />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${styles.toolbarButton} ${editor.isActive('bulletList') ? styles.toolbarButtonActive : ''}`}
          title="无序列表"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${styles.toolbarButton} ${editor.isActive('orderedList') ? styles.toolbarButtonActive : ''}`}
          title="有序列表"
        >
          <ListOrdered size={16} />
        </button>
      </div>
      <EditorContent editor={editor} className={styles.editorContent} />
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('请输入产品标题')
      return
    }
    if (!formData.description.trim()) {
      toast.error('请输入产品描述')
      return
    }
    onSubmit(formData)
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || []
    })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>
          {mode === 'new' ? '新建产品' : '编辑产品'}
        </h2>
      </div>

      <div className={styles.formBody}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Package size={16} />
              产品标题 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={styles.input}
              placeholder="请输入产品标题"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Tag size={16} />
              产品分类
            </label>
            <input
              type="text"
              value={formData.categoryName || ''}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              className={styles.input}
              placeholder="请输入产品分类"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            <FileText size={16} />
            产品描述 *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={styles.textarea}
            placeholder="请输入产品描述"
            rows={3}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <DollarSign size={16} />
              现价 *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className={styles.input}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <DollarSign size={16} />
              原价
            </label>
            <input
              type="number"
              value={formData.originalPrice || ''}
              onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || undefined })}
              className={styles.input}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            <ImageIcon size={16} />
            产品图片
          </label>
          <input
            type="text"
            value={formData.image || ''}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className={styles.input}
            placeholder="请输入图片URL"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            <Tag size={16} />
            产品标签
          </label>
          <div className={styles.tagInput}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className={styles.input}
              placeholder="输入标签后按回车添加"
            />
            <button type="button" onClick={handleAddTag} className={styles.addButton}>
              添加
            </button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className={styles.tags}>
              {formData.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            <FileText size={16} />
            产品详情
          </label>
          <RichTextEditor
            value={formData.content}
            onChange={(value) => setFormData({ ...formData, content: value })}
            placeholder="请输入产品详情..."
          />
        </div>
      </div>

      <div className={styles.formFooter}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          取消
        </button>
        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? '保存中...' : (
            <>
              <Save size={16} />
              保存
            </>
          )}
        </button>
      </div>
    </form>
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
      const response = await fetch('/api/products')
      const result = await response.json()
      if (result.success && result.data) {
        setProducts(result.data)
      }
    } catch (error) {
      console.error('获取产品列表失败:', error)
      toast.error('获取产品列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data: Product) => {
    try {
      setSubmitting(true)
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        toast.success('产品创建成功')
        setViewMode('list')
        fetchProducts()
      } else {
        toast.error(result.message || '创建失败')
      }
    } catch (error) {
      console.error('创建产品失败:', error)
      toast.error('创建产品失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (data: Product) => {
    if (!currentProduct?.id) return
    try {
      setSubmitting(true)
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: currentProduct.id })
      })
      const result = await response.json()
      if (result.success) {
        toast.success('产品更新成功')
        setViewMode('list')
        fetchProducts()
      } else {
        toast.error(result.message || '更新失败')
      }
    } catch (error) {
      console.error('更新产品失败:', error)
      toast.error('更新产品失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个产品吗？')) return
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (result.success) {
        toast.success('产品删除成功')
        fetchProducts()
      } else {
        toast.error(result.message || '删除失败')
      }
    } catch (error) {
      console.error('删除产品失败:', error)
      toast.error('删除产品失败')
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>加载中...</p>
      </div>
    )
  }

  if (viewMode === 'new') {
    return (
      <ProductForm
        onSubmit={handleCreate}
        onCancel={() => setViewMode('list')}
        loading={submitting}
        mode="new"
      />
    )
  }

  if (viewMode === 'edit' && currentProduct) {
    return (
      <ProductForm
        initialData={currentProduct}
        onSubmit={handleUpdate}
        onCancel={() => {
          setViewMode('list')
          setCurrentProduct(null)
        }}
        loading={submitting}
        mode="edit"
      />
    )
  }

  if (viewMode === 'view' && currentProduct) {
    return (
      <div className={styles.detailView}>
        <div className={styles.detailHeader}>
          <button onClick={() => {
            setViewMode('list')
            setCurrentProduct(null)
          }} className={styles.backButton}>
            <ArrowLeft size={20} />
            返回列表
          </button>
          <h2 className={styles.detailTitle}>{currentProduct.title}</h2>
        </div>
        <div className={styles.detailBody}>
          <div className={styles.detailSection}>
            <h3>产品描述</h3>
            <p>{currentProduct.description}</p>
          </div>
          {currentProduct.content && (
            <div className={styles.detailSection}>
              <h3>产品详情</h3>
              <div dangerouslySetInnerHTML={{ __html: currentProduct.content }} />
            </div>
          )}
          <div className={styles.detailMeta}>
            <div className={styles.metaItem}>
              <DollarSign size={16} />
              <span>现价: ¥{currentProduct.price}</span>
            </div>
            {currentProduct.originalPrice && (
              <div className={styles.metaItem}>
                <span>原价: ¥{currentProduct.originalPrice}</span>
              </div>
            )}
            {currentProduct.categoryName && (
              <div className={styles.metaItem}>
                <Tag size={16} />
                <span>{currentProduct.categoryName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>产品管理</h1>
        <button onClick={() => setViewMode('new')} className={styles.primaryButton}>
          <Plus size={20} />
          新建产品
        </button>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div className={styles.tableRow}>
            <div className={styles.tableCell}>产品名称</div>
            <div className={styles.tableCell}>分类</div>
            <div className={styles.tableCell}>价格</div>
            <div className={styles.tableCell}>状态</div>
            <div className={styles.tableCell}>操作</div>
          </div>
        </div>
        <div className={styles.tableBody}>
          {products.length === 0 ? (
            <div className={styles.empty}>
              <Package size={48} />
              <p>暂无产品数据</p>
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <div className={styles.productName}>{product.title}</div>
                  <div className={styles.productDesc}>{product.description}</div>
                </div>
                <div className={styles.tableCell}>{product.categoryName || '-'}</div>
                <div className={styles.tableCell}>¥{product.price}</div>
                <div className={styles.tableCell}>
                  <span className={`${styles.status} ${product.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                    {product.status === 'active' ? '上架' : '下架'}
                  </span>
                </div>
                <div className={styles.tableCell}>
                  <div className={styles.actions}>
                    <button
                      onClick={() => {
                        setCurrentProduct(product)
                        setViewMode('view')
                      }}
                      className={styles.iconButton}
                      title="查看"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentProduct(product)
                        setViewMode('edit')
                      }}
                      className={styles.iconButton}
                      title="编辑"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => product.id && handleDelete(product.id)}
                      className={`${styles.iconButton} ${styles.deleteButton}`}
                      title="删除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
