"use client"

import type { ModuleData, ModuleProps } from "./types"

import { SiteRootModule } from "./site-root"
import { HeaderModule } from "./site-header"
import { HeroModule } from "./section-hero"
import { ServicesModule } from "./section-services"
import { PartnerModule } from "./section-partner"
import { ProductsModule } from "./section-products"
import { PricingModule } from "./section-pricing"
import { AboutModule } from "./section-about"
import { ContactModule } from "./section-contact"
import { FooterModule } from "./site-footer"
import { NewsListModule } from "./news-list"
import { NewsDetailModule } from "./news-detail"
import { ProductListModule } from "./product-list"
import { ProductDetailModule } from "./product-detail"
import { NotFoundModule } from "./section-404"
import { ContentModule } from "./section-content"
import { ImageModule } from "./section-image"
import { SpacerModule } from "./section-spacer"

interface ModuleRendererProps {
  modules: ModuleData[]
}

export function ModuleRenderer({ modules }: ModuleRendererProps) {
  return (
    <>
      {modules.map((module) => {
        const props: ModuleProps = {
          moduleName: module.moduleName,
          moduleId: module.moduleId,
          moduleInstanceId: module.moduleInstanceId,
          data: module.data
        }

        switch (module.moduleId) {
          case 'site-root':
            return <SiteRootModule key={module.moduleInstanceId} {...props} />
          case 'site-header':
            return <HeaderModule key={module.moduleInstanceId} {...props} />
          case 'section-hero':
            return <HeroModule key={module.moduleInstanceId} {...props} />
          case 'section-services':
            return <ServicesModule key={module.moduleInstanceId} {...props} />
          case 'section-partner':
            return <PartnerModule key={module.moduleInstanceId} {...props} />
          case 'section-products':
            return <ProductsModule key={module.moduleInstanceId} {...props} />
          case 'section-pricing':
            return <PricingModule key={module.moduleInstanceId} {...props} />
          case 'section-about':
            return <AboutModule key={module.moduleInstanceId} {...props} />
          case 'section-contact':
            return <ContactModule key={module.moduleInstanceId} {...props} />
          case 'site-footer':
            return <FooterModule key={module.moduleInstanceId} {...props} />
          case 'news-list':
            return <NewsListModule key={module.moduleInstanceId} {...props} />
          case 'news-detail':
            return <NewsDetailModule key={module.moduleInstanceId} {...props} />
          case 'product-list':
            return <ProductListModule key={module.moduleInstanceId} {...props} />
          case 'product-detail':
            return <ProductDetailModule key={module.moduleInstanceId} {...props} />
          case 'section-404':
            return <NotFoundModule key={module.moduleInstanceId} {...props} />
          case 'section-content':
            return <ContentModule key={module.moduleInstanceId} {...props} />
          case 'section-image':
            return <ImageModule key={module.moduleInstanceId} {...props} />
          case 'section-spacer':
            return <SpacerModule key={module.moduleInstanceId} {...props} />
          default:
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
      })}
    </>
  )
}
