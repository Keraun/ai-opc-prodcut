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

export function initializeModules() {
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
}

export { HeaderModule } from "./site-header/register"
export { HeroModule } from "./section-hero/register"
export { ServicesModule } from "./section-services/register"
export { PartnerModule } from "./section-partner/register"
export { ProductsModule } from "./section-products/register"
export { PricingModule } from "./section-pricing/register"
export { AboutModule } from "./section-about/register"
export { ContactModule } from "./section-contact/register"
export { FooterModule } from "./site-footer/register"
export { SiteRootModule } from "./site-root/register"
export { NewsListModule } from "./news-list/register"
export { NewsDetailModule } from "./news-detail/register"
export { ProductListModule } from "./product-list/register"
export { ProductDetailModule } from "./product-detail/register"
export { NotFoundModule } from "./section-404/register"
