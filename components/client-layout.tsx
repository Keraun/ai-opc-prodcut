"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { InitialDataProvider } from "@/components/initial-data-provider"
import { initializeModules } from "@/modules/init"

// 立即初始化模块，确保在应用加载时就有模块可用
let modulesInitialized = false
if (typeof window !== "undefined") {
  try {
    console.log('[ClientLayout] Initializing modules')
    initializeModules()
    modulesInitialized = true
    console.log('[ClientLayout] Modules initialized successfully')
  } catch (error) {
    console.error('[ClientLayout] Failed to initialize modules:', error)
  }
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <InitialDataProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </InitialDataProvider>
  )
}
