import { registerModule } from "@/modules/registry"
import { SiteRootModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerSiteRootModule() {
  registerModule({
    moduleName: "站点根配置",
    moduleId: "site-root",
    component: SiteRootModule,
    schema,
    defaultData
  })
}

export { SiteRootModule }