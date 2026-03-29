"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Table, Spin } from "@arco-design/web-react"
import { IconPlus, IconDelete, IconEdit, IconEye, IconLeft } from "@arco-design/web-react/icon"
import { toast } from "sonner"
import styles from "./product.module.css"

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

type ViewMode = 'list' | 'new' | 'edit' | 'view'

export function ProductManager() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)

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
    router.push('/admin/products/new')
  }

  const handleEditProduct = (product: Product) => {
    router.push(`/admin/products/edit/${product.id}`)
  }

  const handleViewProduct = (product: Product) => {
    router.push(`/admin/products/view/${product.id}`)
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

  return (
    <div className={styles.listContainer}>
      <div className={styles.listHeader}>
        <div>
          <h2 className={styles.listTitle}>产品管理</h2>
          <p className={styles.listDescription}>管理网站产品信息，包括价格、特性、分类等</p>
        </div>
        <Button
          type="primary"
          icon={<IconPlus />}
          onClick={handleAddProduct}
        >
          新建产品
        </Button>
      </div>

      <Card className={styles.tableCard}>
        <Table
          columns={columns}
          data={products}
          loading={loading}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showTotal: true,
            showJumper: true
          }}
        />
      </Card>
    </div>
  )
}
