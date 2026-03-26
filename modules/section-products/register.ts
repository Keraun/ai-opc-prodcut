import { registerModule } from "@/modules/registry"
import { ProductsModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerProductsModule() {
  registerModule({
    moduleName: "产品区块",
    moduleId: "section-products",
    component: ProductsModule,
    schema,
    defaultData
  })
}

export { ProductsModule }
