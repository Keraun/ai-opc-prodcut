import { registerModule } from "@/modules/registry"
import { ProductDetailModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerProductDetailModule() {
  registerModule({
    moduleName: "产品详情",
    moduleId: "product-detail",
    component: ProductDetailModule,
    schema,
    defaultData
  })
}

export { ProductDetailModule }
