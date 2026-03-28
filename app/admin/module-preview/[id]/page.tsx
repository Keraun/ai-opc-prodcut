"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Spin } from "@arco-design/web-react"
import { toast } from "sonner"
import { getModulePreview } from "@/lib/api-client"
import { initializeModules } from "@/modules/init"
import { getModuleComponent } from "@/modules/registry"

initializeModules()

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

  useEffect(() => {
    fetchModuleInfo()
  }, [moduleId])

  const fetchModuleInfo = async () => {
    try {
      setLoading(true)
      const data = await getModulePreview(moduleId)
      setModuleInfo(data)
    } catch (error) {
      toast.error("加载模块信息失败")
    } finally {
      setLoading(false)
    }
  }

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
  const defaultData = moduleInfo.defaultData || {}

  return (
    <div style={{
      padding: "40px",
      maxWidth: "100%",
      margin: "0 auto",
    }}>
      
      <div style={{
        background: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        minHeight: "400px",
        overflow: "hidden",
      }}>
        {ModuleComponent ? (
          <ModuleComponent
            moduleName={moduleInfo.moduleName || ""}
            moduleId={moduleId}
            moduleInstanceId={`${moduleId}-preview`}
            data={defaultData}
          />
        ) : (
          <div style={{
            padding: "80px 40px",
            background: "#fafafa",
            textAlign: "center",
            color: "#999",
          }}>
            <p style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
              模块组件未找到
            </p>
            <p style={{ margin: 0, fontSize: "14px" }}>
              请检查模块 {moduleId} 是否已正确注册
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
