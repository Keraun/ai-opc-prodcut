"use client"

import { useState, useEffect, useCallback } from "react"
import { Button, Card, Tabs, Drawer } from "@arco-design/web-react"
import { toast } from "sonner"

const TabPane = Tabs.TabPane
import { IconSave, IconEye, IconArrowLeft } from "@arco-design/web-react/icon"
import styles from "../../dashboard.module.css"
import { ModuleDragEditor } from "../module-editor/ModuleDragEditor"
import { PagePreview } from "./PagePreview"

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
  const [pageInfo, setPageInfo] = useState<{ name: string; slug: string } | null>(null)

  useEffect(() => {
    fetchPageData()
  }, [pageId])

  const fetchPageData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/pages/${pageId}`)
      if (response.ok) {
        const data = await response.json()
        setModules(data.modules || [])
        setPageInfo({
          name: data.name,
          slug: data.slug,
        })
      } else {
        toast.error("获取页面数据失败")
      }
    } catch (error) {
      toast.error("获取页面数据失败")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ modules }),
      })

      if (response.ok) {
        toast.success("保存成功")
      } else {
        toast.error("保存失败")
      }
    } catch (error) {
      toast.error("保存失败")
    } finally {
      setSaving(false)
    }
  }

  const handleModulesChange = useCallback((updatedModules: ModuleInfo[]) => {
    setModules(updatedModules)
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
            <span style={{ marginLeft: 12, color: "#6b7280", fontSize: 14 }}>
              /{pageInfo.slug}
            </span>
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
          >
            保存
          </Button>
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
    </div>
  )
}
