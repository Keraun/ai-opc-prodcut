"use client"

import { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { InitialDataProvider } from "@/components/initial-data-provider"
import { initClientErrorHandler } from "@/lib/client-error-handler"
import { initModules } from "@/modules/init-modules"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initModules()
    initClientErrorHandler()
  }, [])

  return (
    <InitialDataProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </InitialDataProvider>
  )
}
