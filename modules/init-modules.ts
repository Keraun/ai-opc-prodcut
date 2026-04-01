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

let initialized = false

export function initModulesSync() {
  if (initialized) {
    console.log('[init-modules] Modules already initialized, skipping')
    return
  }
  
  try {
    console.log('[init-modules] Starting module registration...')
    
    registerSiteRootModule()
    console.log('[init-modules] SiteRoot registered')
    
    registerSiteHeaderModule()
    console.log('[init-modules] SiteHeader registered')
    
    registerHeroModule()
    console.log('[init-modules] Hero registered')
    
    registerServicesModule()
    console.log('[init-modules] Services registered')
    
    registerPartnerModule()
    console.log('[init-modules] Partner registered')
    
    registerProductsModule()
    console.log('[init-modules] Products registered')
    
    registerPricingModule()
    console.log('[init-modules] Pricing registered')
    
    registerAboutModule()
    console.log('[init-modules] About registered')
    
    registerContactModule()
    console.log('[init-modules] Contact registered')
    
    registerSiteFooterModule()
    console.log('[init-modules] SiteFooter registered')
    
    registerNewsListModule()
    console.log('[init-modules] NewsList registered')
    
    registerNewsDetailModule()
    console.log('[init-modules] NewsDetail registered')
    
    registerProductListModule()
    console.log('[init-modules] ProductList registered')
    
    registerProductDetailModule()
    console.log('[init-modules] ProductDetail registered')
    
    registerNotFoundModule()
    console.log('[init-modules] NotFound registered')
    
    registerContentModule()
    console.log('[init-modules] Content registered')
    
    registerImageModule()
    console.log('[init-modules] Image registered')
    
    initialized = true
    console.log('[init-modules] All modules registered successfully')
  } catch (error) {
    console.error('[init-modules] Error initializing modules:', error)
  }
}

if (typeof window !== 'undefined') {
  console.log('[init-modules] Running in browser, initializing modules immediately')
  initModulesSync()
}
