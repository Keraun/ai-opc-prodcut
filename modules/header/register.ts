import { registerModule } from "@/modules/registry"
import { HeaderModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerHeaderModule() {
  registerModule({
    moduleName: "顶部导航",
    moduleId: "header",
    component: HeaderModule,
    schema,
    defaultData
  })
}

export { HeaderModule }
