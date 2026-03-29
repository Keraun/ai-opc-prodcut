import { registerModule } from "@/modules/registry"
import { ContentModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerContentModule() {
  registerModule({
    moduleName: "内容区块",
    moduleId: "section-content",
    component: ContentModule,
    schema,
    defaultData
  })
}

export { ContentModule }
