"use client"

import { useState, useEffect } from "react"

// 全局初始数据类型
interface InitialData {
  site: any
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

// Hook 用于获取初始数据
export function useInitialData() {
  const [data, setData] = useState<InitialData | null>(null)

  useEffect(() => {
    const initialData = getWindowInitialData()
    if (initialData) {
      setData(initialData)
    }
  }, [])

  return { data, isClient: typeof window !== "undefined" }
}

// Hook 用于获取特定配置
export function useConfig<K extends keyof InitialData>(key: K): InitialData[K] | null {
  const [config, setConfig] = useState<InitialData[K] | null>(null)

  useEffect(() => {
    const initialData = getWindowInitialData()
    if (initialData && initialData[key]) {
      setConfig(initialData[key])
    }
  }, [key])

  return config
}
