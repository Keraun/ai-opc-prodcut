"use client"

import { useState, useEffect } from "react"
import { BaseManagement, type ManagementConfig } from "./BaseManagement"
import { Package, Image as ImageIcon, Settings, Plus, X, Edit3, Trash2 } from "lucide-react"
import { Tag, Tooltip, Modal, Input, Button } from '@arco-design/web-react'
import { toast } from "sonner"
import styles from "./BaseManagement.module.css"

export function ProductsManagement() {
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [categoryList, setCategoryList] = useState<{ value: string; label: string }[]>([])
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null)
  const [newCategoryValue, setNewCategoryValue] = useState("")
  const [newCategoryLabel, setNewCategoryLabel] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/product-categories")
      const result = await response.json()
      if (result.success) {
        setCategories(result.data)
        setCategoryList([...result.data])
      }
    } catch (error) {
      console.error("获取产品分类失败:", error)
    }
  }

  const saveCategories = async () => {
    try {
      const response = await fetch("/api/product-categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryList)
      })
      const result = await response.json()
      if (result.success) {
        setCategories(categoryList)
        setShowCategoryModal(false)
        toast.success("分类保存成功")
      } else {
        toast.error(result.message || "保存失败")
      }
    } catch (error) {
      console.error("保存产品分类失败:", error)
      toast.error("保存失败")
    }
  }

  const handleAddCategory = () => {
    if (!newCategoryValue.trim() || !newCategoryLabel.trim()) {
      toast.error("请输入分类标识和名称")
      return
    }
    if (categoryList.some(c => c.value === newCategoryValue)) {
      toast.error("分类标识已存在")
      return
    }
    setCategoryList([...categoryList, { value: newCategoryValue, label: newCategoryLabel }])
    setNewCategoryValue("")
    setNewCategoryLabel("")
  }

  const handleUpdateCategory = (index: number) => {
    if (editingCategoryIndex === null) return
    const updatedList = [...categoryList]
    updatedList[index] = { value: newCategoryValue, label: newCategoryLabel }
    setCategoryList(updatedList)
    setEditingCategoryIndex(null)
    setNewCategoryValue("")
    setNewCategoryLabel("")
  }

  const handleDeleteCategory = (index: number) => {
    setCategoryList(categoryList.filter((_, i) => i !== index))
  }

  const handleEditCategory = (index: number) => {
    setEditingCategoryIndex(index)
    setNewCategoryValue(categoryList[index].value)
    setNewCategoryLabel(categoryList[index].label)
  }

  const handleCancelEdit = () => {
    setEditingCategoryIndex(null)
    setNewCategoryValue("")
    setNewCategoryLabel("")
  }

  const openCategoryModal = () => {
    setCategoryList([...categories])
    setShowCategoryModal(true)
  }

  const config: ManagementConfig = {
    title: "产品",
    apiEndpoint: "/api/products",
    fields: [
      {
        name: "title",
        label: "产品名称",
        type: "text",
        required: true,
        placeholder: "请输入产品名称",
        icon: <Package size={16} />,
        inlineGroup: "基本信息"
      },
      {
        name: "categoryName",
        label: "产品分类",
        type: "select",
        options: categories,
        placeholder: "请选择产品分类",
        icon: <Package size={16} />,
        inlineGroup: "基本信息",
        actionButton: {
          text: "分类管理",
          onClick: openCategoryModal
        }
      },
      {
        name: "description",
        label: "产品描述",
        type: "textarea",
        required: true,
        placeholder: "请输入产品描述",
        rows: 3,
        icon: <Package size={16} />,
        inlineGroup: "描述与图片",
        maxLength: 200
      },
      {
        name: "price",
        label: "价格",
        type: "text",
        placeholder: "请输入价格",
        icon: <Package size={16} />,
        inlineGroup: "基本信息"
      },
      {
        name: "originalPrice",
        label: "原价",
        type: "text",
        placeholder: "请输入原价",
        icon: <Package size={16} />,
        inlineGroup: "基本信息"
      },
      {
        name: "features",
        label: "产品特性",
        type: "richtext",
        placeholder: "请输入产品特性...",
        icon: <Package size={16} />
      },
      {
        name: "link",
        label: "产品链接",
        type: "text",
        placeholder: "请输入产品内部链接",
        icon: <Package size={16} />,
        inlineGroup: "链接与标签"
      },
      {
        name: "buyLink",
        label: "购买链接(可选)",
        type: "text",
        placeholder: "请输入产品外部购买链接",
        icon: <Package size={16} />,
        inlineGroup: "链接与标签"
      },
      {
        name: "tags",
        label: "产品标签",
        type: "tags",
        placeholder: "输入标签后按回车添加",
        icon: <Package size={16} />,
        inlineGroup: "链接与标签"
      },
      {
        name: "mainImage",
        label: "产品主图",
        type: "image",
        hint: "建议尺寸: 800x600px",
        icon: <ImageIcon size={16} />,
        inlineGroup: "描述与图片"
      }
    ],
    columns: [
      {
        key: "mainImage",
        label: "主图",
        width: "80",
        render: (item) => item.mainImage ? (
          <a 
            href={item.mainImage} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <img src={item.mainImage} alt={item.title} className={styles.listImage} />
          </a>
        ) : (
          <span className={styles.emptyValue}>-</span>
        )
      },
      {
        key: "title",
        label: "产品名称",
        width: "150",
        render: (item) => (
          item.buyLink ? (
            <a 
              href={item.buyLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.productName}
              style={{ color: '#1890ff', textDecoration: 'underline' }}
            >
              {item.title}
            </a>
          ) : (
            <div className={styles.productName}>{item.title}</div>
          )
        )
      },
      {
        key: "description",
        label: "产品描述",
        width: "200",
        render: (item) => (
          item.description ? (
            <Tooltip content={item.description}>
              <div className={styles.productDesc}>{item.description}</div>
            </Tooltip>
          ) : (
            <span className={styles.emptyValue}>-</span>
          )
        )
      },
      {
        key: "category",
        label: "分类",
        width: "100",
        render: (item) => item.categoryName ? (
          <Tag color="arcoblue" size="small">{item.categoryName}</Tag>
        ) : (
          <span className={styles.emptyValue}>-</span>
        )
      },
      {
        key: "price",
        label: "价格",
        width: "100",
        render: (item) => (
          <div className={styles.priceInfo}>
            {item.price ? (
              <>
                <span className={styles.currentPrice}>¥{item.price}</span>
                {item.originalPrice && (
                  <span className={styles.originalPrice}>¥{item.originalPrice}</span>
                )}
              </>
            ) : (
              <Tag color="success" size="small">免费</Tag>
            )}
          </div>
        )
      },
      {
        key: "tags",
        label: "标签",
        width: "150",
        render: (item) => item.tags && item.tags.length > 0 ? (
          <div className={styles.tagsList}>
            {item.tags.map((tag: string, index: number) => (
              <Tag key={index} color="purple" size="small">{tag}</Tag>
            ))}
          </div>
        ) : (
          <span className={styles.emptyValue}>-</span>
        )
      },
      {
        key: "status",
        label: "状态",
        width: "80",
        render: (item) => {
          const statusConfig: Record<string, { text: string; color: 'green' | 'red' }> = {
            active: { text: '上架', color: 'green' },
            inactive: { text: '下架', color: 'red' },
          }
          const config = statusConfig[item.status] || statusConfig.inactive
          return <Tag color={config.color}>{config.text}</Tag>
        }
      }
    ],
    emptyIcon: <Package size={48} />,
    emptyText: "暂无产品数据",
    description: "管理网站的所有产品，包括创建、编辑和删除产品",
    statusConfig: {
      field: "status",
      states: [
        { value: "active", label: "下架", action: "下架产品", type: "warning", target: "inactive" },
        { value: "inactive", label: "上架", action: "上架产品", type: "success", target: "active" }
      ]
    }
  }

  return (
    <>
      <BaseManagement config={config} />
      
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} />
            产品分类管理
          </div>
        }
        visible={showCategoryModal}
        onCancel={() => setShowCategoryModal(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={() => setShowCategoryModal(false)}>取消</Button>
            <Button type="primary" onClick={saveCategories}>保存</Button>
          </div>
        }
        style={{ width: '600px' }}
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <Input
              placeholder="分类标识 (如: ai-tools)"
              value={newCategoryValue}
              onChange={setNewCategoryValue}
              style={{ flex: 1 }}
            />
            <Input
              placeholder="分类名称 (如: AI工具)"
              value={newCategoryLabel}
              onChange={setNewCategoryLabel}
              style={{ flex: 1 }}
            />
            <Button 
              type="primary" 
              icon={<Plus size={16} />}
              onClick={editingCategoryIndex !== null ? () => handleUpdateCategory(editingCategoryIndex) : handleAddCategory}
            >
              {editingCategoryIndex !== null ? '更新' : '添加'}
            </Button>
            {editingCategoryIndex !== null && (
              <Button onClick={handleCancelEdit}>
                取消
              </Button>
            )}
          </div>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {categoryList.map((category, index) => (
              <div 
                key={index}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  backgroundColor: '#f9fafb'
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, color: '#1f2937' }}>{category.label}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>标识: {category.value}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button 
                    size="small"
                    icon={<Edit3 size={14} />}
                    onClick={() => handleEditCategory(index)}
                  >
                    编辑
                  </Button>
                  <Button 
                    size="small"
                    status="danger"
                    icon={<Trash2 size={14} />}
                    onClick={() => handleDeleteCategory(index)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
            {categoryList.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
                暂无分类，添加新分类开始
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}
