"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Spin, Message } from "@arco-design/web-react"
import { initializeModules } from "@/modules/init"
import { getModuleComponent } from "@/modules/registry"

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
      
      const pageResponse = await fetch(`/api/admin/pages/${pageId}`)
      if (!pageResponse.ok) {
        Message.error("获取页面数据失败")
        return
      }
      
      const pageData = await pageResponse.json()
      
      const previewResponse = await fetch(`/api/admin/pages/${pageId}/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ modules: pageData.modules || [] }),
      })
      
      const previewData = await previewResponse.json()
      
      if (previewData.success) {
        setPageName(previewData.pageName)
        setModules(previewData.modules)
      } else {
        Message.error(previewData.message || "生成预览失败")
      }
    } catch (error) {
      Message.error("加载预览失败")
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
      <div style={{
        background: "#f5f5f5",
        padding: "16px 24px",
        borderBottom: "1px solid #e5e7eb",
      }}>
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
          页面预览: {pageName}
        </h1>
      </div>
      
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
