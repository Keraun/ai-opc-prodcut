"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Spin } from "@arco-design/web-react"
import { toast } from "sonner"
import { initializeModules } from "@/modules/init"
import { getModuleComponent } from "@/modules/registry"
import { getPagePreview } from "@/lib/api-client"

initializeModules()

interface ModuleInfo {
  moduleId: string
  moduleName: string
  moduleInstanceId: string
  data: Record<string, unknown>
  hasComponent: boolean
}

export default function PagePreviewPage() {
  const params = useParams()
  const pageId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [pageName, setPageName] = useState("")
  const [modules, setModules] = useState<ModuleInfo[]>([])

  useEffect(() => {
    fetchPreviewData()
  }, [pageId])

  const fetchPreviewData = async () => {
    try {
      setLoading(true)
      
      const result = await getPagePreview(pageId)
      
      if (result.success) {
        setPageName(result.pageName || "")
        setModules(result.modules || [])
      } else {
        toast.error(result.message || "生成预览失败")
      }
    } catch (error) {
      toast.error("加载预览失败")
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

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <div style={{ padding: "0" }}>
        {modules.length === 0 ? (
          <div style={{
            padding: "80px 40px",
            textAlign: "center",
            color: "#999",
          }}>
            <p style={{ fontSize: "16px", marginBottom: "8px" }}>
              页面暂无模块
            </p>
            <p style={{ fontSize: "14px" }}>
              请在编辑器中添加模块
            </p>
          </div>
        ) : (
          modules.map((module) => {
            if (!module.hasComponent) {
              return (
                <div
                  key={module.moduleInstanceId}
                  style={{
                    padding: "40px",
                    background: "#f5f5f5",
                    border: "2px dashed #ccc",
                    textAlign: "center",
                    color: "#666",
                    margin: "10px 0",
                  }}
                >
                  模块 {module.moduleName} ({module.moduleId}) - 组件未找到
                </div>
              )
            }

            const ModuleComponent = getModuleComponent(module.moduleId)
            if (!ModuleComponent) {
              return null
            }

            return (
              <ModuleComponent
                key={module.moduleInstanceId}
                moduleName={module.moduleName}
                moduleId={module.moduleId}
                moduleInstanceId={module.moduleInstanceId}
                data={module.data}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
