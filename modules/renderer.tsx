"use client"

import { getModuleComponent } from "./registry"
import type { ModuleData, ModuleProps } from "./types"

import { registerHeroModule } from "./section-hero/register"
import { registerServicesModule } from "./section-services/register"
import { registerPartnerModule } from "./section-partner/register"
import { registerProductsModule } from "./section-products/register"
import { registerPricingModule } from "./section-pricing/register"
import { registerAboutModule } from "./section-about/register"
import { registerContactModule } from "./section-contact/register"
import { registerSiteHeaderModule } from "./site-header/register"
import { registerSiteFooterModule } from "./site-footer/register"
import { registerSiteRootModule } from "./site-root/register"
import { registerNewsListModule } from "./news-list/register"
import { registerNewsDetailModule } from "./news-detail/register"
import { registerProductListModule } from "./product-list/register"
import { registerProductDetailModule } from "./product-detail/register"
import { registerNotFoundModule } from "./section-404/register"
import { registerContentModule } from "./section-content/register"
import { registerImageModule } from "./section-image/register"

let registered = false

if (!registered && typeof window !== 'undefined') {
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
  registered = true
}

interface ModuleRendererProps {
  modules: ModuleData[]
}

export function ModuleRenderer({ modules }: ModuleRendererProps) {
  return (
    <>
      {modules.map((module) => {
        const Component = getModuleComponent(module?.moduleId)
        
        if (!Component) {
          return (
            <div 
              key={module.moduleInstanceId}
              suppressHydrationWarning={true}
              style={{ 
                padding: '20px', 
                background: '#fff3cd', 
                border: '1px solid #ffc107',
                borderRadius: '4px',
                margin: '10px 0'
              }}
            >
              <p style={{ color: '#856404', margin: 0, fontWeight: 'bold' }}>
                模块未找到: {module.moduleId}
              </p>
              <p style={{ color: '#856404', margin: '5px 0 0', fontSize: '12px' }}>
                请检查模块是否已正确安装
              </p>
            </div>
          )
        }

        return (
          <Component
            key={module.moduleInstanceId}
            moduleName={module.moduleName}
            moduleId={module.moduleId}
            moduleInstanceId={module.moduleInstanceId}
            data={module.data}
          />
        )
      })}
    </>
  )
}
