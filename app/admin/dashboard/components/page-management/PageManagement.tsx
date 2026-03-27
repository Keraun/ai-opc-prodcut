"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Modal, Input, Table, Space, Tag, Popconfirm, Radio } from "@arco-design/web-react"
import { IconPlus, IconEdit, IconDelete, IconEye } from "@arco-design/web-react/icon"
import { toast } from "sonner"
import styles from "../../dashboard.module.css"

interface PageInfo {
  id: string
  name: string
  slug: string
  modules: string[]
  type?: 'static' | 'dynamic'
  dynamicParam?: string
  status?: 'draft' | 'published' | 'offline'
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
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
  const [newPageType, setNewPageType] = useState<'static' | 'dynamic'>('static')
  const [newPageDynamicParam, setNewPageDynamicParam] = useState("id")
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
      toast.error("获取页面列表失败")
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePage = async () => {
    if (!newPageName.trim()) {
      toast.error("请输入页面名称")
      return
    }

    if (!newPageSlug.trim()) {
      toast.error("请输入页面路径")
      return
    }

    if (!/^[a-z0-9-]+$/.test(newPageSlug)) {
      toast.error("页面路径只能包含小写字母、数字和连字符")
      return
    }

    if (newPageType === 'dynamic' && !newPageDynamicParam.trim()) {
      toast.error("请输入动态参数名称")
      return
    }

    if (newPageType === 'dynamic' && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(newPageDynamicParam)) {
      toast.error("动态参数名称只能包含字母、数字和下划线，且必须以字母或下划线开头")
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
          type: newPageType,
          dynamicParam: newPageType === 'dynamic' ? newPageDynamicParam : undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("页面创建成功")
        setShowCreateModal(false)
        setNewPageName("")
        setNewPageSlug("")
        setNewPageType('static')
        setNewPageDynamicParam("id")
        fetchPages()
        
        if (onEditPage) {
          onEditPage(data.pageId)
        }
      } else {
        const error = await response.json()
        toast.error(error.message || "创建页面失败")
      }
    } catch (error) {
      toast.error("创建页面失败")
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
        toast.success("页面删除成功")
        fetchPages()
      } else {
        const error = await response.json()
        toast.error(error.message || "删除页面失败")
      }
    } catch (error) {
      toast.error("删除页面失败")
    }
  }

  const handleEditPage = (pageId: string) => {
    if (onEditPage) {
      onEditPage(pageId)
    } else {
      router.push(`/admin/pages/edit/${pageId}`)
    }
  }

  const handlePreviewPage = (slug: string, type?: string, dynamicParam?: string) => {
    if (type === 'dynamic') {
      toast.info("动态路由页面需要在实际访问时才能预览，例如：/" + slug + "/123")
      window.open(`/${slug}/example-id`, "_blank")
    } else {
      window.open(`/${slug}`, "_blank")
    }
  }

  const handlePublishPage = async (pageId: string) => {
    try {
      const response = await fetch(`/api/admin/pages/${pageId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: 'publish' }),
      })

      if (response.ok) {
        toast.success("页面发布成功")
        fetchPages()
      } else {
        const error = await response.json()
        toast.error(error.message || "发布失败")
      }
    } catch (error) {
      toast.error("发布失败")
    }
  }

   const checkPageUsage = async (pageId: string): Promise<string[]> => {
    try {
      const response = await fetch(`/api/admin/pages/${pageId}/usage`)
      if (response.ok) {
        const data = await response.json()
        return data.usedBy || []
      }
      return []
    } catch (error) {
      console.error('检查页面使用情况失败:', error)
      return []
    }
  }

  const handleOfflinePage = async (pageId: string) => {
    // 检查页面是否被其他页面使用
    const usedBy = await checkPageUsage(pageId)
    
    if (usedBy.length > 0) {
      // 显示确认对话框
      const confirm = window.confirm(`此页面被以下页面引用：\n${usedBy.join('\n')}\n\n确定要下线吗？`)
      if (!confirm) {
        return
      }
    }

    try {
      const response = await fetch(`/api/admin/pages/${pageId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: 'offline' }),
      })

      if (response.ok) {
        toast.success("页面已下线")
        fetchPages()
      } else {
        const error = await response.json()
        toast.error(error.message || "下线失败")
      }
    } catch (error) {
      toast.error("下线失败")
    }
  }

  const systemPages = ['home', '404', 'products', 'news', 'news-detail']
  
  const columns = [
    {
      title: "页面名称",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: PageInfo) => (
        <div>
          <span style={{ fontWeight: 500 }}>{name}</span>
          {systemPages.includes(record.id) && (
            <Tag size="small" color="orange" style={{ marginLeft: 8 }}>
              系统页面
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "页面类型",
      dataIndex: "type",
      key: "type",
      render: (type: string) => {
        return <Tag color={type === 'dynamic' ? 'purple' : 'blue'}>
          {type === 'dynamic' ? '动态路由' : '静态页面'}
        </Tag>
      },
    },
    {
      title: "Tab标签",
      dataIndex: "tab",
      key: "tab",
      render: (_: any, record: PageInfo) => {
        const tabMap: Record<string, string> = {
          home: "首页",
          products: "产品",
          news: "资讯",
          'news-detail': "资讯详情",
          '404': "404页面"
        }
        return <Tag color="blue">{tabMap[record.id] || record.name}</Tag>
      },
    },
    {
      title: "路径",
      dataIndex: "slug",
      key: "slug",
      render: (slug: string, record: PageInfo) => {
        if (record.type === 'dynamic') {
          return <Tag color="purple">/{slug}/[{record.dynamicParam || 'id'}]</Tag>
        }
        return <Tag color="blue">/{slug}</Tag>
      },
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
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusConfig = {
          draft: { text: '草稿', color: 'gray' },
          published: { text: '已上线', color: 'green' },
          offline: { text: '已下线', color: 'red' },
        }
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
        return <Tag color={config.color}>{config.text}</Tag>
      },
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
      render: (_: any, record: PageInfo) => {
        const isSystemPage = systemPages.includes(record.id)
        return (
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
              onClick={() => handlePreviewPage(record.slug, record.type, record.dynamicParam)}
            >
              预览
            </Button>
            {record.status === 'draft' && (
              <Button
                type="text"
                size="small"
                status="success"
                onClick={() => handlePublishPage(record.id)}
              >
                发布
              </Button>
            )}
            {record.status === 'published' && (
              <Button
                type="text"
                size="small"
                status="warning"
                onClick={() => handleOfflinePage(record.id)}
                disabled={systemPages.includes(record.id)}
                style={systemPages.includes(record.id) ? { opacity: 0.5 } : {}}
              >
                下线
              </Button>
            )}
            {record.status === 'offline' && (
              <Button
                type="text"
                size="small"
                status="success"
                onClick={() => handlePublishPage(record.id)}
              >
                发布
              </Button>
            )}
            {!isSystemPage ? (
              <Popconfirm
                title="确定要删除此页面吗？"
                content="删除后将无法恢复"
                onOk={() => handleDeletePage(record.id)}
              >
                <Button type="text" size="small" status="danger" icon={<IconDelete />}>
                  删除
                </Button>
              </Popconfirm>
            ) : (
              <Button type="text" size="small" disabled icon={<IconDelete />} style={{ opacity: 0.5 }}>
                删除
              </Button>
            )}
          </Space>
        )
      },
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
          setNewPageType('static')
          setNewPageDynamicParam("id")
        }}
        onOk={handleCreatePage}
        confirmLoading={creating}
        okText="创建"
        cancelText="取消"
        style={{ width: 600 }}
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
              页面类型 <span style={{ color: "#f56c6c" }}>*</span>
            </label>
            <Radio.Group value={newPageType} onChange={(val) => setNewPageType(val as 'static' | 'dynamic')}>
              <Radio value="static">静态页面</Radio>
              <Radio value="dynamic">动态路由页面</Radio>
            </Radio.Group>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9ca3af" }}>
              {newPageType === 'static' 
                ? "静态页面有固定的URL路径，例如：/about" 
                : "动态路由页面包含参数，例如：/news/[id]"}
            </p>
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

          {newPageType === 'dynamic' && (
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                动态参数名称 <span style={{ color: "#f56c6c" }}>*</span>
              </label>
              <Input
                value={newPageDynamicParam}
                onChange={setNewPageDynamicParam}
                placeholder="例如：id、slug"
                addBefore="["
                addAfter="]"
                style={{ width: 240 }}
              />
              <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9ca3af" }}>
                最终路径：/{newPageSlug || 'path'}/[{newPageDynamicParam || 'id'}]
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
