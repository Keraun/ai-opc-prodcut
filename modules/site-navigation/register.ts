import { registerModule } from "@/modules/registry"
import { NavigationModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerNavigationModule() {
  registerModule({
    moduleName: "导航栏",
    moduleId: "site-navigation",
    component: NavigationModule,
    schema,
    defaultData
  })
}

export { NavigationModule }
