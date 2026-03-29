"use client"

import { BaseManagement, type ManagementConfig } from "./BaseManagement"
import { Package } from "lucide-react"
import { Tag, Tooltip } from '@arco-design/web-react'
import styles from "./BaseManagement.module.css"

export function ProductsManagement() {
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
        options: [
          { value: "ai-tools", label: "AI工具" },
          { value: "courses", label: "课程" },
          { value: "services", label: "服务" },
          { value: "other", label: "其他" }
        ],
        placeholder: "请选择产品分类",
        icon: <Package size={16} />,
        inlineGroup: "基本信息"
      },
      {
        name: "description",
        label: "产品描述",
        type: "textarea",
        required: true,
        placeholder: "请输入产品描述",
        rows: 3,
        icon: <Package size={16} />
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
        name: "tags",
        label: "产品标签",
        type: "tags",
        placeholder: "输入标签后按回车添加",
        icon: <Package size={16} />
      },
      {
        name: "features",
        label: "产品特性",
        type: "richtext",
        placeholder: "请输入产品特性...",
        icon: <Package size={16} />
      }
    ],
    columns: [
      {
        key: "title",
        label: "产品名称",
        width: "160",
        render: (item) => (
          <div className={styles.productName}>{item.title}</div>
        )
      },
      {
        key: "description",
        label: "产品描述",
        width: "180",
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
        width: "90",
        render: (item) => item.categoryName ? (
          <Tag color="arcoblue" size="small">{item.categoryName}</Tag>
        ) : (
          <span className={styles.emptyValue}>-</span>
        )
      },
      {
        key: "price",
        label: "价格",
        width: "60",
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
        width: "120",
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
        width: "60",
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
        { value: "active", label: "上架", action: "上架产品", type: "success" },
        { value: "inactive", label: "下架", action: "下架产品", type: "warning" }
      ]
    }
  }

  return <BaseManagement config={config} />
}
