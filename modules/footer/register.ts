import { registerModule } from "@/modules/registry"
import { FooterModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerFooterModule() {
  registerModule({
    moduleName: "页脚",
    moduleId: "footer",
    component: FooterModule,
    schema,
    defaultData
  })
}

export { FooterModule }
