"use client"

import { BaseManagement, type ManagementConfig } from "./BaseManagement"
import { Newspaper, Tag, FileText, Calendar } from "lucide-react"
import { Tooltip } from './CommonTable'
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
        name: "categoryName",
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
        width: "2fr",
        render: (item) => (
          <div>
            <Tooltip content={item.title}>
              <div className="productName">{item.title}</div>
            </Tooltip>
            <div className="productDesc">{item.summary}</div>
          </div>
        )
      },
      {
        key: "categoryName",
        label: "分类",
        render: (item) => item.categoryName || '-'
      },
      {
        key: "author",
        label: "作者",
        render: (item) => item.author || '-'
      },
      {
        key: "status",
        label: "状态",
        render: (item) => (
          <span className={`status ${item.status === 'published' ? 'statusActive' : 'statusInactive'}`}>
            {item.status === 'published' ? '已发布' : '草稿'}
          </span>
        )
      }
    ],
    emptyIcon: <Newspaper size={48} />,
    emptyText: "暂无资讯数据",
    description: "管理网站的所有资讯文章，包括创建、编辑和删除文章"
  }

  return <BaseManagement config={config} />
}
