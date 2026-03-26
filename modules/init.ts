import { registerHeroModule } from "./section-hero/register"
import { registerServicesModule } from "./section-services/register"
import { registerNavigationModule } from "./navigation/register"
import { registerPartnerModule } from "./section-partner/register"
import { registerProductsModule } from "./section-products/register"
import { registerPricingModule } from "./section-pricing/register"
import { registerAboutModule } from "./section-about/register"
import { registerContactModule } from "./section-contact/register"
import { registerSidebarNavModule } from "./sidebar-nav/register"

export function initializeModules() {
  registerHeroModule()
  registerServicesModule()
  registerNavigationModule()
  registerPartnerModule()
  registerProductsModule()
  registerPricingModule()
  registerAboutModule()
  registerContactModule()
  registerSidebarNavModule()
}

export { HeroModule } from "./section-hero/register"
export { ServicesModule } from "./section-services/register"
export { NavigationModule } from "./navigation/register"
export { PartnerModule } from "./section-partner/register"
export { ProductsModule } from "./section-products/register"
export { PricingModule } from "./section-pricing/register"
export { AboutModule } from "./section-about/register"
export { ContactModule } from "./section-contact/register"
export { SidebarNavModule } from "./sidebar-nav/register"
