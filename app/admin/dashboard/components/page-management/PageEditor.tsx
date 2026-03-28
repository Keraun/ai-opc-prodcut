"use client"

import { useState, useEffect, useCallback } from "react"
import { Button, Card, Tabs, Drawer, Tag, TabsProps } from "@arco-design/web-react"
import { toast } from "sonner"
import { getPageDetail, updatePage, publishPage } from "@/lib/api-client"
import { initializeModules } from "@/modules/init"
import { getModuleComponent } from "@/modules/registry"

const TabPane = Tabs.TabPane
import { IconSave, IconEye, IconArrowLeft, IconCheck, IconEdit, IconEyeOpened } from "@/components/icons"
import styles from "../../dashboard.module.css"
import { ModuleDragEditor } from "../module-editor/ModuleDragEditor"
import { PagePreview } from "./PagePreview"

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
  const [activeTab, setActiveTab] = useState<string>('edit')
  const [pageInfo, setPageInfo] = useState<{ 
    name: string
    slug: string
    status?: 'draft' | 'published' | 'offline'
  } | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadPageData()
  }, [pageId])

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
            onClick={() => setActiveTab('preview')}
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
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          type="rounded"
          className={styles.pageEditorTabs}
        >
          <TabPane
            key="edit"
            title={
              <span className={styles.tabTitle}>
                <IconEdit />
                编辑模块
              </span>
            }
          >
            <ModuleDragEditor
              modules={modules}
              onChange={handleModulesChange}
            />
          </TabPane>
          <TabPane
            key="preview"
            title={
              <span className={styles.tabTitle}>
                <IconEyeOpened />
                实时预览
              </span>
            }
          >
            <div className={styles.pageEditorPreview}>
              <div className={styles.pageEditorPreviewHeader}>
                <h3>{pageInfo?.name || pageId}</h3>
                <p>实时预览 - 修改后即刻可见</p>
              </div>
              <div className={styles.pageEditorPreviewContent}>
                {modules.length === 0 ? (
                  <div className={styles.pageEditorPreviewEmpty}>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4, marginBottom: '16px' }}>
                      <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p style={{ fontSize: '18px', fontWeight: '500', color: '#6b7280' }}>页面暂无模块</p>
                    <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>请在"编辑模块"标签页中添加模块</p>
                  </div>
                ) : (
                  modules.map((module) => {
                    const ModuleComponent = getModuleComponent(module.moduleId)
                    if (!ModuleComponent) {
                      return (
                        <div
                          key={module.moduleInstanceId}
                          className={styles.pageEditorPreviewModulePlaceholder}
                        >
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4, marginBottom: '12px' }}>
                            <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p style={{ fontSize: '16px', fontWeight: '500', color: '#6b7280' }}>
                          {module.moduleName}
                        </p>
                        <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
                          ({module.moduleId}) - 组件未找到</p>
                      </div>
                      )
                    }
                    return (
                      <div key={module.moduleInstanceId} className={styles.pageEditorPreviewModule}>
                        <ModuleComponent
                          moduleName={module.moduleName}
                          moduleId={module.moduleId}
                          moduleInstanceId={module.moduleInstanceId}
                          data={module.data}
                        />
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  )
}
