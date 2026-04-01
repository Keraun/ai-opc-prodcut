"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Spin } from "@arco-design/web-react"
import { toast } from "sonner"
import { getModulePreview } from "@/lib/api-client"
import { getModuleComponent } from "@/modules/registry"


export default function ModulePreviewPage() {
  const params = useParams()
  const moduleId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [moduleInfo, setModuleInfo] = useState<{
    success: boolean
    moduleId?: string
    moduleName?: string
    defaultData?: Record<string, unknown>
  } | null>(null)
  const [previewData, setPreviewData] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    fetchModuleInfo()
  }, [moduleId])

  const fetchModuleInfo = async () => {
    try {
      setLoading(true)
      const data = await getModulePreview(moduleId)
      setModuleInfo(data)
      if (data.defaultData) {
        setPreviewData(data.defaultData)
      }
    } catch (error) {
      toast.error("加载模块信息失败")
    } finally {
      setLoading(false)
    }
  }

  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.data && event.data.type === 'MODULE_PREVIEW_DATA') {
      setPreviewData(event.data.data)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [handleMessage])

  useEffect(() => {
    if (moduleInfo?.success) {
      window.parent.postMessage({ type: 'MODULE_PREVIEW_READY' }, '*')
    }
  }, [moduleInfo?.success])

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}>
        <Spin size={40} />
      </div>
    )
  }

  if (!moduleInfo?.success) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        color: "#666",
      }}>
        <div style={{ textAlign: "center" }}>
          <h2>模块不存在</h2>
          <p>请检查模块ID是否正确</p>
        </div>
      </div>
    )
  }

  const ModuleComponent = getModuleComponent(moduleId)
  const displayData = previewData || moduleInfo.defaultData || {}

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <div style={{ padding: "0" }}>
        {ModuleComponent ? (
          <ModuleComponent
            moduleName={moduleInfo.moduleName || ""}
            moduleId={moduleId}
            moduleInstanceId={`${moduleId}-preview`}
            data={displayData}
          />
        ) : (
          <div style={{
            padding: "80px 40px",
            textAlign: "center",
            color: "#999",
          }}>
            <p style={{ fontSize: "16px", marginBottom: "8px" }}>
              模块组件未找到
            </p>
            <p style={{ fontSize: "14px" }}>
              请检查模块 {moduleId} 是否已正确注册
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
