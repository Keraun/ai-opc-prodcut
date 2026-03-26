import { registerModule } from "@/modules/registry"
import { NotFoundModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerNotFoundModule() {
  registerModule({
    moduleName: "404 页面",
    moduleId: "section-404",
    component: NotFoundModule,
    schema,
    defaultData
  })
}

export { NotFoundModule }
