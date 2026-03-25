import { registerHeroModule } from "./hero/register"
import { registerServicesModule } from "./services/register"
import { registerNavigationModule } from "./navigation/register"

export function initializeModules() {
  registerHeroModule()
  registerServicesModule()
  registerNavigationModule()
}

export { HeroModule } from "./hero/register"
export { ServicesModule } from "./services/register"
export { NavigationModule } from "./navigation/register"
