import { registerModule } from "@/modules/registry"
import { FooterModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerSiteFooterModule() {
  registerModule({
    moduleName: "站点页脚",
    moduleId: "site-footer",
    component: FooterModule,
    schema,
    defaultData
  })
}

export { FooterModule }
