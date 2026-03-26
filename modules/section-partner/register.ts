import { registerModule } from "@/modules/registry"
import { PartnerModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerPartnerModule() {
  registerModule({
    moduleName: "合作伙伴区块",
    moduleId: "section-partner",
    component: PartnerModule,
    schema,
    defaultData
  })
}

export { PartnerModule }
