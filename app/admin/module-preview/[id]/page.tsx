"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Spin, Message } from "@arco-design/web-react"

export default function ModulePreviewPage() {
  const params = useParams()
  const moduleId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [moduleInfo, setModuleInfo] = useState<{
    success: boolean
    moduleId: string
    moduleName: string
    defaultData: Record<string, unknown>
  } | null>(null)

  useEffect(() => {
    fetchModuleInfo()
  }, [moduleId])

  const fetchModuleInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/modules/${moduleId}/preview`)
      const data = await response.json()
      
      if (data.success) {
        setModuleInfo(data)
      } else {
        Message.error(data.message || "加载模块信息失败")
      }
    } catch (error) {
      Message.error("加载模块信息失败")
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

  return (
    <div style={{
      padding: "40px",
      maxWidth: "1200px",
      margin: "0 auto",
    }}>
      <div style={{
        background: "#f5f5f5",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "24px",
      }}>
        <h1 style={{ margin: "0 0 8px 0", fontSize: "24px" }}>
          模块预览: {moduleInfo.moduleName}
        </h1>
        <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
          模块ID: {moduleInfo.moduleId}
        </p>
      </div>
      
      <div style={{
        background: "#fff",
        padding: "40px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        minHeight: "400px",
      }}>
        <div style={{
          padding: "20px",
          background: "#fafafa",
          borderRadius: "4px",
          textAlign: "center",
          color: "#999",
        }}>
          <p style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
            模块预览区域
          </p>
          <p style={{ margin: 0, fontSize: "14px" }}>
            实际渲染效果将在页面编辑器中显示
          </p>
        </div>
      </div>
    </div>
  )
}
