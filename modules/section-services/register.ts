import { registerModule } from "@/modules/registry"
import { ServicesModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerServicesModule() {
  registerModule({
    moduleName: "服务区块",
    moduleId: "section-services",
    component: ServicesModule,
    schema,
    defaultData
  })
}

export { ServicesModule }
