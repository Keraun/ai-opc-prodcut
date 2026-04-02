import { registerModule } from "@/modules/registry"
import { SpacerModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerSpacerModule() {
  registerModule({
    moduleName: "空白容器",
    moduleId: "section-spacer",
    component: SpacerModule,
    schema,
    defaultData
  })
}

export { SpacerModule }