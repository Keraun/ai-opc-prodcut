import { registerModule } from "@/modules/registry"
import { ProductListModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerProductListModule() {
  registerModule({
    moduleName: "产品列表",
    moduleId: "product-list",
    component: ProductListModule,
    schema,
    defaultData
  })
}

export { ProductListModule }
