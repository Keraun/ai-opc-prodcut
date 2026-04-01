"use client"

import { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { InitialDataProvider } from "@/components/initial-data-provider"
import { initClientErrorHandler } from "@/lib/client-error-handler"

import { registerHeroModule } from "@/modules/section-hero/register"
import { registerServicesModule } from "@/modules/section-services/register"
import { registerPartnerModule } from "@/modules/section-partner/register"
import { registerProductsModule } from "@/modules/section-products/register"
import { registerPricingModule } from "@/modules/section-pricing/register"
import { registerAboutModule } from "@/modules/section-about/register"
import { registerContactModule } from "@/modules/section-contact/register"
import { registerSiteHeaderModule } from "@/modules/site-header/register"
import { registerSiteFooterModule } from "@/modules/site-footer/register"
import { registerSiteRootModule } from "@/modules/site-root/register"
import { registerNewsListModule } from "@/modules/news-list/register"
import { registerNewsDetailModule } from "@/modules/news-detail/register"
import { registerProductListModule } from "@/modules/product-list/register"
import { registerProductDetailModule } from "@/modules/product-detail/register"
import { registerNotFoundModule } from "@/modules/section-404/register"
import { registerContentModule } from "@/modules/section-content/register"
import { registerImageModule } from "@/modules/section-image/register"

let modulesRegistered = false

function registerAllModules() {
  if (modulesRegistered) {
    return
  }
  console.log('[ClientLayout] Registering all modules')
  try {
    registerSiteRootModule()
    registerSiteHeaderModule()
    registerHeroModule()
    registerServicesModule()
    registerPartnerModule()
    registerProductsModule()
    registerPricingModule()
    registerAboutModule()
    registerContactModule()
    registerSiteFooterModule()
    registerNewsListModule()
    registerNewsDetailModule()
    registerProductListModule()
    registerProductDetailModule()
    registerNotFoundModule()
    registerContentModule()
    registerImageModule()
    modulesRegistered = true
    console.log('[ClientLayout] All modules registered successfully')
  } catch (error) {
    console.error('[ClientLayout] Error registering modules:', error)
  }
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initClientErrorHandler()
    registerAllModules()
  }, [])

  return (
    <InitialDataProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </InitialDataProvider>
  )
}
