"use client"

import { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { InitialDataProvider } from "@/components/initial-data-provider"
import "@/modules/init-modules"
import { initClientErrorHandler } from "@/lib/client-error-handler"

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
