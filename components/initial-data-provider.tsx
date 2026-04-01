"use client"

import { createContext, useContext, ReactNode, useEffect, useMemo, useState } from "react"

// 全局初始数据类型
interface InitialData {
  site: any
  'site-header': any
  'site-footer': any
}

// 默认初始数据
const defaultInitialData: InitialData = {
  site: {},
  'site-header': {},
  'site-footer': {}
}

// 从 window 对象获取初始数据
function getWindowInitialData(): InitialData {
  if (typeof window === "undefined") {
    return defaultInitialData
  }
  const data = (window as any).__INITIAL_DATA__
  if (data) {
    console.log('[InitialDataProvider] Got initial data from window:', {
      hasSite: !!data.site,
      hasHeader: !!data['site-header'],
      hasFooter: !!data['site-footer']
    })
  }
  return data || defaultInitialData
}

// 创建 Context
const InitialDataContext = createContext<{
  data: InitialData
  isClient: boolean
}>({
  data: defaultInitialData,
  isClient: false,
})

// Provider 组件
export function InitialDataProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  const data = useMemo(() => {
    return getWindowInitialData()
  }, [])

  useEffect(() => {
    setIsClient(true)
    console.log('[InitialDataProvider] Client-side initialized')
  }, [])

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
export function useConfig<K extends keyof InitialData>(key: K): InitialData[K] {
  const { data } = useInitialData()
  return data?.[key] || defaultInitialData[key]
}
