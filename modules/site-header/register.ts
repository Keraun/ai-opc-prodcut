import { registerModule } from "@/modules/registry"
import { HeaderModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerSiteHeaderModule() {
  registerModule({
    moduleName: "站点头部",
    moduleId: "site-header",
    component: HeaderModule,
    schema,
    defaultData
  })
}

export { HeaderModule }
