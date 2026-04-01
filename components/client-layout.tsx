"use client"

import { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { InitialDataProvider } from "@/components/initial-data-provider"
import { initializeModules } from "@/modules/init"
import { initClientErrorHandler } from "@/lib/client-error-handler"

let modulesInitialized = false
if (typeof window !== "undefined" && !modulesInitialized) {
  try {
    console.log('[ClientLayout] Initializing modules at top level')
    initializeModules()
    modulesInitialized = true
    console.log('[ClientLayout] Modules initialized successfully at top level')
  } catch (error) {
    console.error('[ClientLayout] Failed to initialize modules:', error)
  }
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initClientErrorHandler()
  }, [])

  return (
    <InitialDataProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </InitialDataProvider>
  )
}
