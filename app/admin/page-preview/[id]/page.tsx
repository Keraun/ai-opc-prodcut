"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Spin } from "@arco-design/web-react"
import { toast } from "sonner"
import { initializeModules } from "@/modules/init"
import { getModuleComponent, getModuleDefaultData } from "@/modules/registry"
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
  const [receivedRealtimeData, setReceivedRealtimeData] = useState(false)

  // 初始加载：获取已保存的数据作为 fallback
  useEffect(() => {
    fetchPreviewData()
  }, [pageId])

  // 监听来自父窗口的实时模块数据
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 检查消息类型
      if (event.data && event.data.type === 'PREVIEW_MODULES_DATA') {
        const { modules: realtimeModules, pageInfo } = event.data

        if (realtimeModules && Array.isArray(realtimeModules)) {
          // 处理模块数据，添加 hasComponent 标记
          const processedModules = realtimeModules.map((module: ModuleInfo) => {
            const ModuleComponent = getModuleComponent(module.moduleId)
            const defaultData = getModuleDefaultData(module.moduleId) || {}

            return {
              ...module,
              data: { ...defaultData, ...module.data },
              hasComponent: !!ModuleComponent,
            }
          })

          setModules(processedModules)
          if (pageInfo?.name) {
            setPageName(pageInfo.name)
          }
          setReceivedRealtimeData(true)
          setLoading(false)
        }
      }
    }

    window.addEventListener('message', handleMessage)

    // 设置超时：如果 3 秒内没有收到实时数据，则使用已保存的数据
    const timeout = setTimeout(() => {
      if (!receivedRealtimeData) {
        // 继续使用已加载的数据（由 fetchPreviewData 设置）
        console.log('No realtime data received, using saved data')
      }
    }, 3000)

    return () => {
      window.removeEventListener('message', handleMessage)
      clearTimeout(timeout)
    }
  }, [pageId, receivedRealtimeData])

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
