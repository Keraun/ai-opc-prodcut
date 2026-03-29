"use client"

import { useState } from "react"
import { BaseManagement, type ManagementConfig } from "./BaseManagement"
import { Package } from "lucide-react"
import styles from "./BaseManagement.module.css"

function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [show, setShow] = useState(false)
  
  return (
    <div 
      className={styles.tooltipWrapper}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && content && (
        <div className={styles.tooltip}>{content}</div>
      )}
    </div>
  )
}

export function ProductsManagement() {
  const config: ManagementConfig = {
    title: "产品",
    apiEndpoint: "/api/products",
    fields: [
      {
        name: "name",
        label: "产品名称",
        type: "text",
        required: true,
        placeholder: "请输入产品名称",
        icon: <Package size={16} />
      },
      {
        name: "category",
        label: "产品分类",
        type: "text",
        placeholder: "请输入产品分类",
        icon: <Package size={16} />
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
        icon: <Package size={16} />
      },
      {
        name: "originalPrice",
        label: "原价",
        type: "text",
        placeholder: "请输入原价",
        icon: <Package size={16} />
      },
      {
        name: "status",
        label: "状态",
        type: "select",
        options: [
          { value: "active", label: "上架" },
          { value: "inactive", label: "下架" }
        ],
        icon: <Package size={16} />
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
        key: "name",
        label: "产品名称",
        width: "2fr",
        render: (item) => (
          <div>
            <Tooltip content={item.name}>
              <div className="productName">{item.name}</div>
            </Tooltip>
            <div className="productDesc">{item.description}</div>
          </div>
        )
      },
      {
        key: "category",
        label: "分类",
        render: (item) => item.category || '-'
      },
      {
        key: "price",
        label: "价格",
        render: (item) => item.price ? `¥${item.price}` : '免费'
      },
      {
        key: "status",
        label: "状态",
        render: (item) => (
          <span className={`status ${item.status === 'active' ? 'statusActive' : 'statusInactive'}`}>
            {item.status === 'active' ? '上架' : '下架'}
          </span>
        )
      }
    ],
    emptyIcon: <Package size={48} />,
    emptyText: "暂无产品数据",
    description: "管理网站的所有产品，包括创建、编辑和删除产品"
  }

  return <BaseManagement config={config} />
}
