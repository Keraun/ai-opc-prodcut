"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button, Drawer, Tag } from "@arco-design/web-react"
import { toast } from "sonner"
import { getPageDetail, updatePage, publishPage } from "@/lib/api-client"
import { initializeModules } from "@/modules/init"

import { IconSave, IconEye, IconArrowLeft, IconCheck } from "@/components/icons"
import styles from "../../dashboard.module.css"
import { ModuleDragEditor } from "../module-editor/ModuleDragEditor"

initializeModules()

interface ModuleInfo {
  moduleId: string
  moduleName: string
  moduleInstanceId: string
  data: Record<string, unknown>
}

interface PageEditorProps {
  pageId: string
  onBack?: () => void
}

export function PageEditor({ pageId, onBack }: PageEditorProps) {
  const [modules, setModules] = useState<ModuleInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [pageInfo, setPageInfo] = useState<{
    name: string
    slug: string
    status?: 'draft' | 'published' | 'offline'
  } | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'web' | 'mobile' | 'ipad'>('web')
  const previewIframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    loadPageData()
  }, [pageId])

  // 当预览打开时，发送当前模块数据到 iframe
  useEffect(() => {
    if (showPreview && previewIframeRef.current) {
      const iframe = previewIframeRef.current
      // 等待 iframe 加载完成后再发送数据
      const sendModulesData = () => {
        iframe.contentWindow?.postMessage(
          {
            type: 'PREVIEW_MODULES_DATA',
            modules: modules,
            pageInfo: pageInfo,
          },
          '*'
        )
      }

      // 如果 iframe 已经加载完成，直接发送
      if (iframe.contentWindow) {
        // 延迟一点确保 iframe 已经准备好接收消息
        setTimeout(sendModulesData, 100)
      }

      // 监听 iframe 加载完成事件
      iframe.onload = sendModulesData

      return () => {
        iframe.onload = null
      }
    }
  }, [showPreview, modules, pageInfo])

  const loadPageData = async () => {
    setLoading(true)
    const data = await getPageDetail(pageId)
    if (data) {
      setModules(data.modules || [])
      setPageInfo({
        name: data.name,
        slug: data.slug,
        status: data.status,
      })
      setHasChanges(false)
    } else {
      toast.error("获取页面数据失败")
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const success = await updatePage(pageId, { modules })
    if (success) {
      toast.success("保存成功")
      setHasChanges(false)
    } else {
      toast.error("保存失败")
    }
    setSaving(false)
  }

  const handlePublish = async () => {
    if (hasChanges) {
      toast.error("请先保存更改后再发布")
      return
    }

    const success = await publishPage(pageId)
    if (success) {
      toast.success("页面发布成功")
      loadPageData()
    } else {
      toast.error("发布失败")
    }
  }

  const handleModulesChange = useCallback((updatedModules: ModuleInfo[]) => {
    setModules(updatedModules)
    setHasChanges(true)
  }, [])

  const handlePreview = () => {
    setShowPreview(true)
  }

  if (loading) {
    return (
      <div className={styles.pageEditor}>
        <div className={styles.loading}>加载中...</div>
      </div>
    )
  }

  return (
    <div className={styles.pageEditor}>
      <div className={styles.pageEditorHeader}>
        <div className={styles.pageEditorTitle}>
          <Button
            type="text"
            icon={<IconArrowLeft />}
            onClick={onBack}
            style={{ marginRight: 12 }}
          >
            返回
          </Button>
          <h2 style={{ margin: 0 }}>
            编辑页面：{pageInfo?.name || pageId}
          </h2>
          {pageInfo && (
            <>
              <span style={{ marginLeft: 12, color: "#6b7280", fontSize: 14 }}>
                /{pageInfo.slug}
              </span>
              <Tag 
                color={pageInfo.status === 'published' ? 'green' : pageInfo.status === 'offline' ? 'red' : 'gray'}
                style={{ marginLeft: 12 }}
              >
                {pageInfo.status === 'published' ? '已上线' : pageInfo.status === 'offline' ? '已下线' : '草稿'}
              </Tag>
            </>
          )}
        </div>
        <div className={styles.pageEditorActions}>
          <Button
            type="outline"
            icon={<IconEye />}
            onClick={() => setShowPreview(true)}
            style={{ marginRight: 8 }}
          >
            实时预览
          </Button>
          <Button
            type="primary"
            icon={<IconSave />}
            loading={saving}
            onClick={handleSave}
            style={{ marginRight: 8 }}
          >
            保存
          </Button>
          {pageInfo?.status !== 'published' && (
            <Button
              type="primary"
              status="success"
              icon={<IconCheck />}
              onClick={handlePublish}
              disabled={hasChanges}
            >
              发布
            </Button>
          )}
        </div>
      </div>

      <div className={styles.pageEditorContent}>
        <ModuleDragEditor
          modules={modules}
          onChange={handleModulesChange}
        />
      </div>

      <Drawer
        className={styles.previewDrawer}
        visible={showPreview}
        placement="right"
        width={1200}
        closable={false}
        autoFocus={false}
        maskClosable={true}
        onCancel={() => setShowPreview(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>页面预览</span>
              {pageInfo && (
                <>
                  <Tag color="arcoblue">{pageInfo.name}</Tag>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>/{pageInfo.slug}</span>
                  <Tag 
                    size="small"
                    color={pageInfo.status === 'published' ? 'green' : pageInfo.status === 'offline' ? 'red' : 'gray'}
                  >
                    {pageInfo.status === 'published' ? '已上线' : pageInfo.status === 'offline' ? '已下线' : '草稿'}
                  </Tag>
                </>
              )}
              <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                <Button 
                  type={previewDevice === 'web' ? 'primary' : 'secondary'} 
                  size="small"
                  onClick={() => setPreviewDevice('web')}
                >
                  Web
                </Button>
                <Button 
                  type={previewDevice === 'mobile' ? 'primary' : 'secondary'} 
                  size="small"
                  onClick={() => setPreviewDevice('mobile')}
                >
                  Mobile
                </Button>
                <Button 
                  type={previewDevice === 'ipad' ? 'primary' : 'secondary'} 
                  size="small"
                  onClick={() => setPreviewDevice('ipad')}
                >
                  iPad
                </Button>
              </div>
            </div>
            <Button onClick={() => setShowPreview(false)}>关闭</Button>
          </div>
        }
      >
        <div style={{ 
          width: '100%', 
          height: 'calc(100vh - 80px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          background: '#f0f2f5',
          padding: '20px'
        }}>
          <div style={{
            width: previewDevice === 'web' ? '100%' : previewDevice === 'mobile' ? '375px' : '768px',
            height: '100%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            background: '#fff'
          }}>
            <iframe
              ref={previewIframeRef}
              src={`/admin/page-preview/${pageId}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="页面预览"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
