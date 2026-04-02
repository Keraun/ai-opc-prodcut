import { registerHeroModule } from './section-hero/register'
import { registerServicesModule } from './section-services/register'
import { registerPartnerModule } from './section-partner/register'
import { registerProductsModule } from './section-products/register'
import { registerPricingModule } from './section-pricing/register'
import { registerAboutModule } from './section-about/register'
import { registerContactModule } from './section-contact/register'
import { registerSiteHeaderModule } from './site-header/register'
import { registerSiteFooterModule } from './site-footer/register'
import { registerSiteRootModule } from './site-root/register'
import { registerNewsListModule } from './news-list/register'
import { registerNewsDetailModule } from './news-detail/register'
import { registerProductListModule } from './product-list/register'
import { registerProductDetailModule } from './product-detail/register'
import { registerNotFoundModule } from './section-404/register'
import { registerContentModule } from './section-content/register'
import { registerImageModule } from './section-image/register'
import { registerSpacerModule } from './section-spacer/register'

let initialized = false

export function initModules() {
  if (initialized) {
    return
  }
  console.log('[InitModules] Initializing all modules')
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
    registerSpacerModule()
    initialized = true
    console.log('[InitModules] All modules initialized successfully')
  } catch (error) {
    console.error('[InitModules] Error initializing modules:', error)
  }
}
