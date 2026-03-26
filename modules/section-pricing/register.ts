import { registerModule } from "@/modules/registry"
import { PricingModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerPricingModule() {
  registerModule({
    moduleName: "价格区块",
    moduleId: "section-pricing",
    component: PricingModule,
    schema,
    defaultData
  })
}

export { PricingModule }
