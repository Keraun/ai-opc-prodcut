"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Modal, Input, Table, Space, Tag, Popconfirm, Message } from "@arco-design/web-react"
import { IconPlus, IconEdit, IconDelete, IconEye } from "@arco-design/web-react/icon"
import styles from "../dashboard.module.css"

interface PageInfo {
  id: string
  name: string
  slug: string
  modules: string[]
  createdAt?: string
  updatedAt?: string
}

interface PageManagementProps {
  onEditPage?: (pageId: string) => void
}

export function PageManagement({ onEditPage }: PageManagementProps) {
  const router = useRouter()
  const [pages, setPages] = useState<PageInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPageName, setNewPageName] = useState("")
  const [newPageSlug, setNewPageSlug] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/pages")
      if (response.ok) {
        const data = await response.json()
        setPages(data.pages || [])
      }
    } catch (error) {
      Message.error("获取页面列表失败")
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePage = async () => {
    if (!newPageName.trim()) {
      Message.error("请输入页面名称")
      return
    }

    if (!newPageSlug.trim()) {
      Message.error("请输入页面路径")
      return
    }

    if (!/^[a-z0-9-]+$/.test(newPageSlug)) {
      Message.error("页面路径只能包含小写字母、数字和连字符")
      return
    }

    setCreating(true)
    try {
      const response = await fetch("/api/admin/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newPageName,
          slug: newPageSlug,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        Message.success("页面创建成功")
        setShowCreateModal(false)
        setNewPageName("")
        setNewPageSlug("")
        fetchPages()
        
        if (onEditPage) {
          onEditPage(data.pageId)
        }
      } else {
        const error = await response.json()
        Message.error(error.message || "创建页面失败")
      }
    } catch (error) {
      Message.error("创建页面失败")
    } finally {
      setCreating(false)
    }
  }

  const handleDeletePage = async (pageId: string) => {
    try {
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        Message.success("页面删除成功")
        fetchPages()
      } else {
        const error = await response.json()
        Message.error(error.message || "删除页面失败")
      }
    } catch (error) {
      Message.error("删除页面失败")
    }
  }

  const handleEditPage = (pageId: string) => {
    if (onEditPage) {
      onEditPage(pageId)
    } else {
      router.push(`/admin/pages/edit/${pageId}`)
    }
  }

  const handlePreviewPage = (slug: string) => {
    window.open(`/${slug}`, "_blank")
  }

  const columns = [
    {
      title: "页面名称",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: "路径",
      dataIndex: "slug",
      key: "slug",
      render: (slug: string) => <Tag color="blue">/{slug}</Tag>,
    },
    {
      title: "模块数量",
      dataIndex: "modules",
      key: "modules",
      render: (modules: string[]) => (
        <Tag color="green">{modules?.length || 0} 个模块</Tag>
      ),
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) => (date ? new Date(date).toLocaleString("zh-CN") : "-"),
    },
    {
      title: "操作",
      key: "actions",
      render: (_: any, record: PageInfo) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<IconEdit />}
            onClick={() => handleEditPage(record.id)}
          >
            编辑
          </Button>
          <Button
            type="text"
            size="small"
            icon={<IconEye />}
            onClick={() => handlePreviewPage(record.slug)}
          >
            预览
          </Button>
          <Popconfirm
            title="确定要删除此页面吗？"
            content="删除后将无法恢复"
            onOk={() => handleDeletePage(record.id)}
          >
            <Button type="text" size="small" status="danger" icon={<IconDelete />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className={styles.pageManagement}>
      <div className={styles.pageManagementHeader}>
        <div>
          <h2 style={{ margin: 0, marginBottom: 8 }}>页面管理</h2>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
            管理网站的所有页面，包括创建、编辑和删除页面
          </p>
        </div>
        <Button
          type="primary"
          icon={<IconPlus />}
          onClick={() => setShowCreateModal(true)}
        >
          新建页面
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={pages}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
          }}
        />
      </Card>

      <Modal
        title="新建页面"
        visible={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false)
          setNewPageName("")
          setNewPageSlug("")
        }}
        onOk={handleCreatePage}
        confirmLoading={creating}
        okText="创建"
        cancelText="取消"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
              页面名称 <span style={{ color: "#f56c6c" }}>*</span>
            </label>
            <Input
              value={newPageName}
              onChange={setNewPageName}
              placeholder="例如：首页、产品列表、关于我们"
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
              页面路径 <span style={{ color: "#f56c6c" }}>*</span>
            </label>
            <Input
              value={newPageSlug}
              onChange={setNewPageSlug}
              placeholder="例如：home、products、about"
              addBefore="/"
            />
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9ca3af" }}>
              只能包含小写字母、数字和连字符，例如：my-page-1
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
