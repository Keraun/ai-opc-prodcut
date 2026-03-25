"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { InitialDataProvider } from "@/components/initial-data-provider"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <InitialDataProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </InitialDataProvider>
  )
}
