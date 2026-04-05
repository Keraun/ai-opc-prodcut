"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Modal, Input, Space, Popconfirm, Radio, Tag } from "@arco-design/web-react"
import { toast } from "sonner"
import { 
  getPageList, 
  createPageWithResponse, 
  deletePage, 
  publishPage, 
  offlinePage,
  getPageUsage 
} from "@/lib/api-client"
import { IconPlus, IconEdit, IconDelete, IconEye } from "@/components/icons"
import { ManagementHeader } from '../ManagementHeader'
import { CommonTable, ActionButton } from '../CommonTable'
import styles from "../../dashboard.module.css"

interface PageInfo {
  id: string
  dbId: number
  name: string
  slug: string
  modules: any[]
  type?: 'static' | 'dynamic'
  dynamicParam?: string
  route?: string
  status?: 'draft' | 'published' | 'offline'
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  isSystem?: boolean
}

interface PageManagementProps {
  onEditPage?: (pageId: string) => void
}

export function PageManagement({ onEditPage }: PageManagementProps) {
  const router = useRouter()
  const [pages, setPages] = useState<PageInfo[]>([])
  const [systemPages, setSystemPages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPageName, setNewPageName] = useState("")
  const [newPageSlug, setNewPageSlug] = useState("")
  const [newPageType, setNewPageType] = useState<'static' | 'dynamic'>('static')
  const [newPageDynamicParam, setNewPageDynamicParam] = useState("id")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function loadData() {
      await loadPages()
      await loadSystemPages()
    }
    loadData()
  }, [])

  const loadSystemPages = async () => {
    const pages = await getPageList()
    const systemPagesList = pages.filter((page: any) => page.isSystem).map((page: any) => page.id)
    setSystemPages(systemPagesList)
  }

  const loadPages = async () => {
    setLoading(true)
    const pages = await getPageList()
    if (pages !== null) {
      setPages(pages || [])
    } else {
      toast.error("获取页面列表失败")
    }
    setLoading(false)
  }

  const handleCreatePage = async () => {
    if (creating) {
      return
    }

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
      const result = await createPageWithResponse({
        name: newPageName,
        slug: newPageSlug,
        type: newPageType,
        dynamicParam: newPageType === 'dynamic' ? newPageDynamicParam : undefined,
      })

      if (result.success) {
        toast.success("页面创建成功")
        setShowCreateModal(false)
        setNewPageName("")
        setNewPageSlug("")
        setNewPageType('static')
        setNewPageDynamicParam("id")
        loadPages()

        if (onEditPage && result.pageId) {
          onEditPage(result.pageId)
        }
      } else {
        toast.error(result.message || "创建页面失败")
      }
    } catch (error) {
      toast.error("创建页面失败")
    } finally {
      setCreating(false)
    }
  }

  const handleDeletePage = async (pageId: string) => {
    const success = await deletePage(pageId)
    if (success) {
      toast.success("页面删除成功")
      loadPages()
    } else {
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

  const handlePreviewPage = (slug: string, type?: string, dynamicParam?: string, route?: string) => {
    if (type === 'dynamic') {
      // 对于资讯详情和产品详情页面，默认使用 id 为 1
      const isNewsDetail = slug === 'news' || route?.includes('news')
      const isProductDetail = slug === 'product' || route?.includes('product')
      const defaultId = (isNewsDetail || isProductDetail) ? '1' : '0'
      const previewRoute = route ? route.replace(/\[.*?\]/, defaultId) : `/${slug}/${defaultId}`
      window.open(previewRoute, "_blank")
    } else {
      window.open(`/${slug}`, "_blank")
    }
  }

  const handlePublishPage = async (pageId: string) => {
    const success = await publishPage(pageId)
    if (success) {
      toast.success("页面发布成功")
      loadPages()
    } else {
      toast.error("发布失败")
    }
  }

  const checkPageUsage = async (pageId: string): Promise<string[]> => {
    return await getPageUsage(pageId)
  }

  const handleOfflinePage = async (pageId: string) => {
    const usedBy = await checkPageUsage(pageId)

    if (usedBy.length > 0) {
      const confirm = window.confirm(`此页面被以下页面引用：\n${usedBy.join('\n')}\n\n确定要下线吗？`)
      if (!confirm) {
        return
      }
    }

    const success = await offlinePage(pageId)
    if (success) {
      toast.success("页面已下线")
      loadPages()
    } else {
      toast.error("下线失败")
    }
  }

  const columns = [
    {
      title: "序号",
      dataIndex: "dbId",
      key: "dbId",
      width: 70,
    },
    {
      title: "页面名称",
      dataIndex: "name",
      key: "name",
      width: 120,
    },
    {
      title: "页面属性",
      dataIndex: "pageType",
      key: "pageType",
      width: 100,
      render: (_: any, record: PageInfo) => {
        const isSystemPage = systemPages.includes(record.id)
        return <Tag color={isSystemPage ? 'orange' : 'green'}>
          {isSystemPage ? '系统页面' : '用户页面'}
        </Tag>
      },
    },
    {
      title: "页面类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: string) => {
        return <Tag color={type === 'dynamic' ? 'purple' : 'blue'}>
          {type === 'dynamic' ? '动态路由' : '静态页面'}
        </Tag>
      },
    },
    {
      title: "路径",
      dataIndex: "slug",
      key: "slug",
      width: 160,
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
      width: 90,
      render: (modules: string[]) => (
        <Tag color="green">{modules?.length || 0} 个模块</Tag>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status: string) => {
        const statusConfig: Record<string, { text: string; color: 'gray' | 'green' | 'red' }> = {
          draft: { text: '草稿', color: 'gray' },
          published: { text: '已上线', color: 'green' },
          offline: { text: '已下线', color: 'red' },
        }
        const config = statusConfig[status] || statusConfig.draft
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: "操作",
      key: "actions",
      width: 300,
      fixed: 'right' as const,
      render: (_: any, record: PageInfo) => {
        const isSystemPage = systemPages.includes(record.id)
        return (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <ActionButton
              type="primary"
              icon={<IconEdit size={16} />}
              onClick={() => handleEditPage(record.id)}
            >
              编辑
            </ActionButton>
            <ActionButton
              type="default"
              icon={<IconEye size={16} />}
              onClick={() => handlePreviewPage(record.slug, record.type, record.dynamicParam, record.route)}
            >
              预览
            </ActionButton>
            {record.status === 'draft' && (
              <ActionButton
                type="success"
                onClick={() => handlePublishPage(record.id)}
              >
                发布
              </ActionButton>
            )}
            {record.status === 'published' && (
              <ActionButton
                type="warning"
                onClick={() => handleOfflinePage(record.id)}
                disabled={systemPages.includes(record.id)}
              >
                下线
              </ActionButton>
            )}
            {record.status === 'offline' && (
              <ActionButton
                type="success"
                onClick={() => handlePublishPage(record.id)}
              >
                发布
              </ActionButton>
            )}
            {!isSystemPage ? (
              <Popconfirm
                title="确定要删除此页面吗？"
                content="删除后将无法恢复"
                onOk={() => handleDeletePage(record.id)}
              >
                <ActionButton
                  type="danger"
                  icon={<IconDelete size={16} />}
                  onClick={() => handleDeletePage(record.id)}
                >
                  删除
                </ActionButton>
              </Popconfirm>
            ) : (
              <ActionButton
                type="danger"
                icon={<IconDelete size={16} />}
                disabled
              >
                删除
              </ActionButton>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className={styles.pageManagement}>
      <ManagementHeader
        title="页面管理"
        description="管理网站的所有页面，包括创建、编辑和删除页面"
        buttonText="新建页面"
        buttonIcon={<IconPlus />}
        onButtonClick={() => setShowCreateModal(true)}
      />

      <CommonTable
        columns={columns}
        data={pages}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1100 }}
        pagination={{
          pageSize: 10,
        }}
        emptyText="暂无页面数据"
      />

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
