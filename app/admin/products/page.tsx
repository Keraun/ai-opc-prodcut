"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Table, Message } from "@arco-design/web-react"
import { IconPlus } from "@arco-design/web-react/icon"
import { toast } from "sonner"
import styles from "./products.module.css"

interface Product {
  id: number
  title: string
  description: string
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

export default function ProductsListPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

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
      width: 160,
      render: (_: any, record: Product) => (
        <div className={styles.actionButtons}>
          <Button
            type="text"
            size="small"
            onClick={() => handleViewProduct(record)}
          >
            查看
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => handleEditProduct(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            size="small"
            status="danger"
            onClick={() => handleDeleteProduct(record)}
          >
            删除
          </Button>
        </div>
      )
    }
  ]

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
    </div>
  )
}
