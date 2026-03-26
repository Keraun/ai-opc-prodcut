import { registerModule } from "@/modules/registry"
import { ContactModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerContactModule() {
  registerModule({
    moduleName: "联系我们区块",
    moduleId: "section-contact",
    component: ContactModule,
    schema,
    defaultData
  })
}

export { ContactModule }
