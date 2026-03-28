"use client"

import { useState, useEffect, useCallback } from "react"
import { Button, Card, Tabs, Drawer, Tag } from "@arco-design/web-react"
import { toast } from "sonner"

const TabPane = Tabs.TabPane
import { IconSave, IconEye, IconArrowLeft, IconCheck } from "@arco-design/web-react/icon"
import styles from "../../dashboard.module.css"
import { ModuleDragEditor } from "../module-editor/ModuleDragEditor"
import { PagePreview } from "./PagePreview"
import { 
  getPageDetail, 
  updatePageModulesApi, 
  publishPageApi 
} from "@/lib/api-client"

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
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    fetchPageData()
  }, [pageId])

  const fetchPageData = async () => {
    setLoading(true)
    try {
      const data = await getPageDetail(pageId)
      console.log('=== API 响应 ===')
      console.log('完整响应:', data)
      console.log('data.modules:', data?.modules)
      console.log('modules 类型:', Array.isArray(data?.modules))
      console.log('modules 长度:', data?.modules?.length)
      
      if (data?.modules && data.modules.length > 0) {
        console.log('第一个模块数据:', data.modules[0])
        console.log('第一个模块的 data:', data.modules[0].data)
        console.log('第一个模块的 data 类型:', typeof data.modules[0].data)
      }
      
      if (data) {
        setModules(data.modules || [])
        setPageInfo({
          name: data.name,
          slug: data.slug,
          status: data.status,
        })
        setHasChanges(false)
        
        setDebugInfo(`
✅ API 响应成功
页面: ${data.name}
模块数量: ${data.modules?.length || 0}
第一个模块: ${data.modules?.[0]?.moduleName || 'N/A'}
第一个模块 data: ${JSON.stringify(data.modules?.[0]?.data || {})}
        `.trim())
      } else {
        toast.error("获取页面数据失败")
        setDebugInfo('❌ API 响应失败')
      }
    } catch (error) {
      toast.error("获取页面数据失败")
      setDebugInfo(`❌ 请求错误: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      console.log('=== 保存数据 ===')
      console.log('即将保存的 modules:', modules)
      
      const result = await updatePageModulesApi(pageId, modules)

      if (result.success) {
        toast.success(result.message || "保存成功")
        setHasChanges(false)
      } else {
        toast.error(result.message || "保存失败")
      }
    } catch (error) {
      toast.error("保存失败")
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (hasChanges) {
      toast.error("请先保存更改后再发布")
      return
    }

    try {
      const result = await publishPageApi(pageId)

      if (result.success) {
        toast.success(result.message || "页面发布成功")
        fetchPageData()
      } else {
        toast.error(result.message || "发布失败")
      }
    } catch (error) {
      toast.error("发布失败")
    }
  }

  const handleModulesChange = useCallback((updatedModules: ModuleInfo[]) => {
    console.log('=== 模块变化 ===')
    console.log('更新后的 modules:', updatedModules)
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
        {debugInfo && (
          <div style={{ padding: 20, background: '#f0f0f0', margin: 20, borderRadius: 8 }}>
            <h3>调试信息</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{debugInfo}</pre>
          </div>
        )}
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
            onClick={handlePreview}
            style={{ marginRight: 8 }}
          >
            预览
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
        title="页面预览"
        visible={showPreview}
        onOk={() => setShowPreview(false)}
        onCancel={() => setShowPreview(false)}
        width="80%"
        footer={null}
      >
        <PagePreview pageId={pageId} modules={modules} />
      </Drawer>

      {debugInfo && (
        <div style={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20, 
          width: 400, 
          maxHeight: 300, 
          overflow: 'auto',
          background: '#fff', 
          border: '1px solid #ddd',
          padding: 16,
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999
        }}>
          <h4 style={{ margin: '0 0 8px 0' }}>调试信息</h4>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>{debugInfo}</pre>
        </div>
      )}
    </div>
  )
}
