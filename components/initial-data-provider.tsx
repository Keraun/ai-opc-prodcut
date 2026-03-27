"use client"

import { createContext, useContext, ReactNode, useEffect, useMemo } from "react"

// 全局初始数据类型
interface InitialData {
  site: any
  'site-navigation': any
  'site-header': any
  'site-footer': any
}

// 从 window 对象获取初始数据
function getWindowInitialData(): InitialData | null {
  if (typeof window === "undefined") {
    return null
  }
  return (window as any).__INITIAL_DATA__ || null
}

// 创建 Context，默认值直接从 window 读取
const InitialDataContext = createContext<{
  data: InitialData | null
  isClient: boolean
}>({
  data: null,
  isClient: false,
})

// Provider 组件
export function InitialDataProvider({ children }: { children: ReactNode }) {
  // 使用 useMemo 确保数据在客户端渲染时立即可用
  const data = useMemo(() => {
    if (typeof window !== "undefined") {
      return getWindowInitialData()
    }
    return null
  }, [])

  // isClient 状态
  const isClient = typeof window !== "undefined"

  return (
    <InitialDataContext.Provider value={{ data, isClient }}>
      {children}
    </InitialDataContext.Provider>
  )
}

// Hook 用于消费初始数据
export function useInitialData() {
  const context = useContext(InitialDataContext)
  if (!context) {
    throw new Error("useInitialData must be used within InitialDataProvider")
  }
  return context
}

// Hook 用于获取特定配置
export function useConfig<K extends keyof InitialData>(key: K): InitialData[K] | null {
  const { data } = useInitialData()
  return data?.[key] || null
}
