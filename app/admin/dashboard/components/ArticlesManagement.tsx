"use client"

import { BaseManagement, type ManagementConfig } from "./BaseManagement"
import { Newspaper, Tag, FileText, Calendar, User } from "lucide-react"
import { Tag as ArcoTag, Tooltip } from '@arco-design/web-react'
import styles from "./BaseManagement.module.css"

export function ArticlesManagement() {
  const config: ManagementConfig = {
    title: "资讯",
    apiEndpoint: "/api/articles",
    fields: [
      {
        name: "title",
        label: "文章标题",
        type: "text",
        required: true,
        placeholder: "请输入文章标题",
        icon: <Newspaper size={16} />
      },
      {
        name: "category",
        label: "文章分类",
        type: "text",
        placeholder: "请输入文章分类",
        icon: <Tag size={16} />
      },
      {
        name: "summary",
        label: "文章摘要",
        type: "textarea",
        required: true,
        placeholder: "请输入文章摘要",
        rows: 3,
        icon: <FileText size={16} />
      },
      {
        name: "author",
        label: "作者",
        type: "text",
        placeholder: "请输入作者名称",
        icon: <Calendar size={16} />
      },
      {
        name: "status",
        label: "状态",
        type: "select",
        options: [
          { value: "draft", label: "草稿" },
          { value: "published", label: "已发布" }
        ],
        icon: <Tag size={16} />
      },
      {
        name: "tags",
        label: "文章标签",
        type: "tags",
        placeholder: "输入标签后按回车添加",
        icon: <Tag size={16} />
      },
      {
        name: "content",
        label: "文章内容",
        type: "richtext",
        placeholder: "请输入文章内容...",
        icon: <FileText size={16} />
      }
    ],
    columns: [
      {
        key: "title",
        label: "文章标题",
        width: 250,
        render: (item) => (
          <div className={styles.productInfo}>
            <Tooltip content={item.title}>
              <div className={styles.productName}>{item.title}</div>
            </Tooltip>
            <Tooltip content={item.summary}>
              <div className={styles.productDesc}>{item.summary}</div>
            </Tooltip>
          </div>
        )
      },
      {
        key: "category",
        label: "分类",
        width: 70,
        render: (item) => item.category ? (
          <ArcoTag color="orange" size="small">{item.category}</ArcoTag>
        ) : (
          <span className={styles.emptyValue}>-</span>
        )
      },
      {
        key: "author",
        label: "作者",
        width: 120,
        render: (item) => item.author ? (
          <div className={styles.authorInfo}>
            <User size={14} />
            <span>{item.author}</span>
          </div>
        ) : (
          <span className={styles.emptyValue}>-</span>
        )
      },
      {
        key: "tags",
        label: "标签",
        width: 160,
        render: (item) => item.tags && item.tags.length > 0 ? (
          <div className={styles.tagsList}>
            {item.tags.map((tag: string, index: number) => (
              <ArcoTag key={index} color="purple" size="small">{tag}</ArcoTag>
            ))}
          </div>
        ) : (
          <span className={styles.emptyValue}>-</span>
        )
      },
      {
        key: "status",
        label: "状态",
        width: 70,
        render: (item) => {
          const statusConfig: Record<string, { text: string; color: 'gray' | 'green' }> = {
            draft: { text: '草稿', color: 'gray' },
            published: { text: '已发布', color: 'green' },
          }
          const config = statusConfig[item.status] || statusConfig.draft
          return <ArcoTag color={config.color}>{config.text}</ArcoTag>
        }
      }
    ],
    emptyIcon: <Newspaper size={48} />,
    emptyText: "暂无资讯数据",
    description: "管理网站的所有资讯文章，包括创建、编辑和删除文章"
  }

  return <BaseManagement config={config} />
}
